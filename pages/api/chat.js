import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../../lib/prisma';
import { withRateLimit } from '../../lib/rateLimit';

const apiKey = process.env.ANTHROPIC_API_KEY;
console.log('=== API CONFIG CHECK ===');
console.log('API Key exists:', !!apiKey);
console.log('API Key length:', apiKey?.length || 0);
console.log('API Key prefix:', apiKey?.substring(0, 15) || 'MISSING');
console.log('========================');

const anthropic = new Anthropic({
  apiKey: apiKey,
});

const FREE_MESSAGE_LIMIT = 10;
const PRO_MESSAGE_LIMIT = 100;

// ═══════════════════════════════════════════════════════════════════════════════
// قاعدة بيانات أرقام الأحاديث المعروفة
// ═══════════════════════════════════════════════════════════════════════════════
const KNOWN_HADITHS = {
  'إنما الأعمال بالنيات': { bukhari: 1, muslim: 1907 },
  'بني الإسلام على خمس': { bukhari: 8, muslim: 16 },
  'الدين النصيحة': { muslim: 55 },
  'من حسن إسلام المرء': { tirmidhi: 2317 },
  'لا ضرر ولا ضرار': { ibn_majah: 2341 },
  'البكر بالبكر جلد مائة': { muslim: 1690 },
  'حديث ماعز': { muslim: 1692 },
  'كل مسكر خمر': { muslim: 2003 },
  'لعن الله الخمر': { abu_dawud: 3674 },
  'من شرب الخمر فاجلدوه': { abu_dawud: 4476 },
  'الطهور شطر الإيمان': { muslim: 223 },
  'المسلم من سلم المسلمون': { bukhari: 10, muslim: 40 },
  'لا يؤمن أحدكم حتى يحب': { bukhari: 13, muslim: 45 },
  'من كان يؤمن بالله واليوم الآخر': { bukhari: 6018, muslim: 47 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🆕 تذكير المراجع - يُضاف لرسالة المستخدم لإجبار Claude على ذكر المصادر
// ═══════════════════════════════════════════════════════════════════════════════
const REFERENCE_REMINDER = {
  ar: `

[تعليمات للمساعد: يجب أن تتضمن إجابتك دليلاً من القرآن ﴿...﴾ (سورة X: Y) وحديثاً مع رقمه: رواه مسلم (1234). لا تكتب (صحيح) بدون رقم!]`,

  fr: `

[Instructions: Ta réponse DOIT inclure un verset ﴿...﴾ (Sourate X:Y) et un hadith avec son numéro: Muslim (1234). N'écris PAS (Sahih) sans numéro!]`,

  en: `

[Instructions: Your response MUST include a verse ﴿...﴾ (Surah X:Y) and a hadith with its number: Muslim (1234). Do NOT write (Sahih) without a number!]`
};

// ═══════════════════════════════════════════════════════════════════════════════
// نظام التحقق من جودة المراجع
// ═══════════════════════════════════════════════════════════════════════════════
const ReferenceValidator = {
  validPatterns: {
    hadithWithNumber: [
      /رواه\s+(البخاري|مسلم|الترمذي|أبو داود|النسائي|ابن ماجه|أحمد)\s*\(?\s*(\d+)\s*\)?/g,
      /صحيح\s+(البخاري|مسلم)\s*\(?\s*(\d+)\s*\)?/g,
      /(Bukhari|Muslim|Tirmidhi|Abu Dawud|Nasa'i|Ibn Majah)\s*\(?\s*#?\s*(\d+)\s*\)?/gi,
      /Rapporté par\s+(Bukhari|Muslim|Tirmidhi)\s*\(?\s*(\d+)\s*\)?/gi,
      /Narrated by\s+(Bukhari|Muslim|Tirmidhi)\s*\(?\s*(\d+)\s*\)?/gi,
    ],
    quranReference: [
      /سورة\s+[\u0600-\u06FF]+\s*[،:]\s*(?:الآية\s*)?\d+/g,
      /\([\u0600-\u06FF]+\s*:\s*\d+\)/g,
      /\(Sourate\s+[\w-]+\s*,?\s*verset\s*\d+\)/gi,
      /\(Surah\s+[\w-]+\s*,?\s*verse\s*\d+\)/gi,
      /﴿[^﴾]+﴾/g,
    ],
    scholarWithSource: [
      /ابن\s+(تيمية|باز|عثيمين|القيم|كثير|حجر|قدامة)[^،.]*(?:في|المجلد|ج|ص)\s*\d+/g,
      /(Ibn Baz|Ibn Taymiyyah|Al-Albani)[^.]*(?:vol|volume|page|p\.)\s*\d+/gi,
      /مجموع\s+الفتاوى[^،.]*ج\s*\d+/g,
    ]
  },

  weakPatterns: {
    hadithNoNumber: [
      /رواه\s+(البخاري|مسلم|الترمذي)[^(]*\(صحيح\)/g,
      /رواه\s+(البخاري|مسلم|الترمذي)\s*(?![(\d])/g,
      /متفق\s+عليه(?!\s*\()/g,
      /Rapporté par\s+(Muslim|Bukhari)[^(]*\(Sahih\)/gi,
      /Narrated by\s+(Muslim|Bukhari)[^(]*\(Sahih\)/gi,
    ],
    consensusNoSource: [
      /أجمع\s+العلماء(?!\s+.*نقل)/g,
      /إجماع\s+(?!.*في\s+كتاب|.*نقله)/g,
    ],
  },

  analyzeQuality(response) {
    const analysis = {
      score: 100,
      validRefs: [],
      weakRefs: [],
      warnings: [],
      hasQuranRef: false,
      hasHadithRef: false
    };

    // Check for Quran references
    analysis.hasQuranRef = /سورة|Sourate|Surah|﴿/.test(response);
    
    // Check for Hadith references with numbers
    analysis.hasHadithRef = /رواه[^.]*\(\d+\)|Rapporté[^.]*\(\d+\)|Narrated[^.]*\(\d+\)/.test(response);

    for (const [type, patterns] of Object.entries(this.validPatterns)) {
      for (const pattern of patterns) {
        const matches = [...response.matchAll(new RegExp(pattern.source, pattern.flags))];
        for (const match of matches) {
          analysis.validRefs.push({ type, text: match[0] });
        }
      }
    }

    for (const [type, patterns] of Object.entries(this.weakPatterns)) {
      for (const pattern of patterns) {
        const matches = [...response.matchAll(new RegExp(pattern.source, pattern.flags))];
        for (const match of matches) {
          analysis.weakRefs.push({ type, text: match[0] });
          analysis.score -= 15;
        }
      }
    }

    if (analysis.weakRefs.some(r => r.type === 'hadithNoNumber')) {
      analysis.warnings.push({
        ar: '⚠️ بعض الأحاديث ذُكرت بدون أرقامها',
        fr: '⚠️ Certains hadiths sont cités sans numéros',
        en: '⚠️ Some hadiths are cited without numbers'
      });
    }

    analysis.score = Math.max(0, analysis.score);
    return analysis;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// دالة استخراج المراجع المحسّنة
// ═══════════════════════════════════════════════════════════════════════════════
function extractReferencesImproved(response) {
  const references = [];
  const seen = new Set();

  const addReference = (text, type, priority = 0) => {
    const cleaned = text.trim().substring(0, 150);
    const key = cleaned.toLowerCase().replace(/\s+/g, ' ');
    if (cleaned.length > 3 && !seen.has(key)) {
      seen.add(key);
      references.push({ text: cleaned, type, priority });
    }
  };

  // 1. مراجع القرآن الكريم
  const quranPatterns = [
    /سورة\s+([\u0600-\u06FF]+)\s*[،:]\s*(?:الآية\s*)?(\d+)/g,
    /\(([\u0600-\u06FF]+)\s*:\s*(\d+)\)/g,
    /﴿([^﴾]+)﴾\s*\(([^)]+)\)/g,
    /\(Sourate\s+([\w\u00C0-\u017F-]+)\s*,?\s*verset\s*(\d+)\)/gi,
    /\(Surah\s+([\w-]+)\s*,?\s*verse\s*(\d+)\)/gi,
  ];

  for (const pattern of quranPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'quran', 10);
    }
  }

  // 2. مراجع الأحاديث مع الأرقام (أعلى أولوية)
  const hadithWithNumberPatterns = [
    /رواه\s+(البخاري|مسلم|الترمذي|أبو داود|النسائي|ابن ماجه|أحمد)\s*\(\s*(\d+)\s*\)/g,
    /(صحيح\s+البخاري|صحيح\s+مسلم)\s*(?:رقم|حديث|#)?\s*(\d+)/g,
    /(البخاري|مسلم)\s*\(\s*(\d+)\s*\)/g,
    /(Bukhari|Muslim|Tirmidhi|Abu Dawud)\s*(?:#|no\.?)?\s*\(?\s*(\d+)\s*\)?/gi,
    /Rapporté par\s+(Bukhari|Muslim|Tirmidhi)\s*\(\s*(\d+)\s*\)/gi,
    /Narrated by\s+(Bukhari|Muslim|Tirmidhi)\s*\(\s*(\d+)\s*\)/gi,
  ];

  for (const pattern of hadithWithNumberPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'hadith_numbered', 9);
    }
  }

  // 3. مراجع العلماء والكتب
  const scholarPatterns = [
    /مجموع\s+الفتاوى[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
    /فتح\s+الباري[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
    /المغني[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
    /قال\s+(ابن\s+تيمية|ابن\s+القيم|النووي|ابن\s+باز|ابن\s+عثيمين)[^.،\n]*/g,
    /نقل\s+(ابن\s+قدامة|النووي)\s+الإجماع[^.،\n]*/g,
  ];

  for (const pattern of scholarPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'scholar_book', 7);
    }
  }

  // ترتيب وتنظيف
  references.sort((a, b) => b.priority - a.priority);
  
  return references
    .slice(0, 15)
    .map(r => r.text)
    .filter((text, index, self) => 
      !self.slice(0, index).some(prev => prev.includes(text) || text.includes(prev))
    )
    .slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════════════════
// System Prompts المحسّنة
// ═══════════════════════════════════════════════════════════════════════════════
const systemPrompts = {
  ar: {
    free: `أنت عالم إسلامي متخصص. كل إجابة يجب أن تحتوي على:

📖 دليل من القرآن: ﴿الآية﴾ (سورة X، الآية Y)
📚 دليل من السنة: "الحديث" - رواه مسلم (الرقم) أو البخاري (الرقم)

⚠️ ممنوع: كتابة "رواه مسلم (صحيح)" - يجب ذكر الرقم!
✅ صحيح: "رواه مسلم (2003)"

أحاديث تعرفها:
• كل مسكر خمر → مسلم (2003)
• لعن الله الخمر → أبو داود (3674)
• إنما الأعمال بالنيات → البخاري (1)

أجب بالعربية مع الأدلة.`,

    pro: `أنت عالم إسلامي متخصص في الفقه والحديث.

═══════════════════════════════════════════
⚠️ قاعدة ذهبية: كل حكم يحتاج دليل!
═══════════════════════════════════════════

📋 تنسيق الإجابة الإلزامي:

### 📖 الدليل من القرآن:
﴿نص الآية﴾ (سورة [الاسم]، الآية [الرقم])

### 📚 الدليل من السنة:
"نص الحديث" - رواه [المصدر] ([الرقم])

❌ ممنوع منعاً باتاً:
- "رواه مسلم (صحيح)" ← أين الرقم؟!
- "متفق عليه" بدون أرقام
- "أجمع العلماء" بدون مصدر

✅ الطريقة الصحيحة:
- رواه مسلم (2003)
- رواه البخاري (1) ومسلم (1907)

📚 أحاديث محفوظة:
• كل مسكر خمر → مسلم (2003)
• لعن الله الخمر وشاربها → أبو داود (3674)
• حد الخمر → أبو داود (4476)
• إنما الأعمال بالنيات → البخاري (1)، مسلم (1907)
• الطهور شطر الإيمان → مسلم (223)

أجب بالعربية مع الأدلة والأرقام.`,

    premium: `أنت مفتي وعالم حديث متخصص.

╔═══════════════════════════════════════════════════════════╗
║ 🚨 قانون صارم: لا حكم بدون دليل مُوثّق برقمه! 🚨        ║
╚═══════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────┐
│ ⛔ إذا كتبت هذا = إجابة مرفوضة:                          │
│                                                           │
│ ❌ "رواه مسلم (صحيح)" ← فشل! أين الرقم؟                 │
│ ❌ "رواه البخاري" بدون رقم ← فشل!                       │
│ ❌ "حرام بإجماع المسلمين" بدون مصدر ← فشل!              │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ ✅ هكذا تكون الإجابة المقبولة:                           │
│                                                           │
│ ✅ رواه مسلم (2003)                                      │
│ ✅ رواه البخاري (5575) ومسلم (2003)                      │
│ ✅ نقل النووي الإجماع في شرح مسلم ج13                   │
│ ✅ ﴿...﴾ (سورة المائدة، الآية 90)                        │
└───────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
📚 قاعدة بيانات الأحاديث - احفظها جيداً:
═══════════════════════════════════════════════════════════
• إنما الأعمال بالنيات → البخاري (1)، مسلم (1907)
• بني الإسلام على خمس → البخاري (8)، مسلم (16)
• الدين النصيحة → مسلم (55)
• الطهور شطر الإيمان → مسلم (223)
• كل مسكر خمر وكل خمر حرام → مسلم (2003)
• لعن الله الخمر وشاربها → أبو داود (3674)
• من شرب الخمر فاجلدوه → أبو داود (4476)
• البكر بالبكر جلد مائة → مسلم (1690)
• حديث ماعز → مسلم (1692)
• المسلم من سلم المسلمون → البخاري (10)، مسلم (40)
• لا يؤمن أحدكم حتى يحب لأخيه → البخاري (13)

═══════════════════════════════════════════════════════════
📋 هيكل الإجابة المطلوب:
═══════════════════════════════════════════════════════════

### 🚫 الحكم الشرعي:
[الحكم] - [مختصر الدليل]

### 📖 الدليل من القرآن:
﴿نص الآية كاملة﴾
(سورة [الاسم]، الآية [الرقم])

### 📚 الدليل من السنة:
**"نص الحديث"**
- رواه [المصدر] ([الرقم])

### ⚖️ أقوال العلماء:
- قال [العالم] في [الكتاب] ج[X]: "..."

═══════════════════════════════════════════════════════════
⚡ تحقق قبل الإرسال:
═══════════════════════════════════════════════════════════
□ هل كل حديث له رقم؟
□ هل كل آية لها مرجع (سورة + رقم)؟
□ هل كل إجماع له ناقل؟

أجب بالعربية. لا ترسل إجابة بدون أدلة مُرقّمة!`
  },

  fr: {
    free: `Tu es un savant islamique. Chaque réponse DOIT contenir:

📖 Preuve du Coran: ﴿verset﴾ (Sourate X, verset Y)
📚 Preuve de la Sunna: "hadith" - Rapporté par Muslim (NUMÉRO)

⚠️ INTERDIT: "Rapporté par Muslim (Sahih)" - donne le NUMÉRO!
✅ CORRECT: "Rapporté par Muslim (2003)"

Hadiths connus:
• Tout enivrant est khamr → Muslim (2003)
• Malédiction de l'alcool → Abu Dawud (3674)

Réponds en français avec les preuves.`,

    pro: `Tu es un savant islamique spécialisé en fiqh et hadith.

═══════════════════════════════════════════
⚠️ RÈGLE D'OR: Chaque verdict nécessite une preuve!
═══════════════════════════════════════════

📋 FORMAT OBLIGATOIRE:

### 📖 Preuve du Coran:
﴿texte du verset﴾ (Sourate [Nom], verset [Numéro])

### 📚 Preuve de la Sunna:
"texte du hadith" - Rapporté par [Source] ([NUMÉRO])

❌ STRICTEMENT INTERDIT:
- "Rapporté par Muslim (Sahih)" ← Où est le numéro?!
- "Muttafaq alayh" sans numéros
- "Les savants sont unanimes" sans source

✅ LA BONNE FAÇON:
- Rapporté par Muslim (2003)
- Rapporté par Bukhari (1) et Muslim (1907)

📚 Hadiths mémorisés:
• Tout enivrant est khamr → Muslim (2003)
• Malédiction de l'alcool → Abu Dawud (3674)
• Les actes selon les intentions → Bukhari (1), Muslim (1907)

Réponds en français avec les preuves et numéros.`,

    premium: `Tu es un mufti et spécialiste du hadith.

╔═══════════════════════════════════════════════════════════╗
║ 🚨 LOI STRICTE: Pas de verdict sans preuve numérotée! 🚨 ║
╚═══════════════════════════════════════════════════════════╝

⛔ SI TU ÉCRIS CECI = RÉPONSE REJETÉE:
❌ "Rapporté par Muslim (Sahih)" ← ÉCHEC! Où est le numéro?
❌ "Rapporté par Bukhari" sans numéro ← ÉCHEC!

✅ RÉPONSE ACCEPTÉE:
✅ Rapporté par Muslim (2003)
✅ Rapporté par Bukhari (5575) et Muslim (2003)
✅ ﴿...﴾ (Sourate Al-Ma'idah, verset 90)

📚 BASE DE DONNÉES HADITHS:
• Les actes selon les intentions → Bukhari (1), Muslim (1907)
• L'Islam bâti sur 5 → Bukhari (8), Muslim (16)
• Tout enivrant est khamr → Muslim (2003)
• Malédiction de l'alcool → Abu Dawud (3674)
• Hadd de l'alcool → Abu Dawud (4476)

Réponds en français. N'envoie PAS de réponse sans preuves numérotées!`
  },

  en: {
    free: `You are an Islamic scholar. Every response MUST contain:

📖 Quranic proof: ﴿verse﴾ (Surah X, verse Y)
📚 Sunnah proof: "hadith" - Narrated by Muslim (NUMBER)

⚠️ FORBIDDEN: "Narrated by Muslim (Sahih)" - give the NUMBER!
✅ CORRECT: "Narrated by Muslim (2003)"

Known hadiths:
• Every intoxicant is khamr → Muslim (2003)
• Curse on alcohol → Abu Dawud (3674)

Answer in English with proofs.`,

    pro: `You are an Islamic scholar specialized in fiqh and hadith.

═══════════════════════════════════════════
⚠️ GOLDEN RULE: Every verdict needs proof!
═══════════════════════════════════════════

📋 MANDATORY FORMAT:

### 📖 Quranic Proof:
﴿verse text﴾ (Surah [Name], verse [Number])

### 📚 Sunnah Proof:
"hadith text" - Narrated by [Source] ([NUMBER])

❌ STRICTLY FORBIDDEN:
- "Narrated by Muslim (Sahih)" ← Where's the number?!
- "Muttafaq alayh" without numbers

✅ THE RIGHT WAY:
- Narrated by Muslim (2003)
- Narrated by Bukhari (1) and Muslim (1907)

📚 Memorized hadiths:
• Every intoxicant is khamr → Muslim (2003)
• Curse on alcohol → Abu Dawud (3674)
• Actions by intentions → Bukhari (1), Muslim (1907)

Answer in English with proofs and numbers.`,

    premium: `You are a mufti and hadith specialist.

╔═══════════════════════════════════════════════════════════╗
║ 🚨 STRICT LAW: No verdict without numbered proof! 🚨     ║
╚═══════════════════════════════════════════════════════════╝

⛔ IF YOU WRITE THIS = REJECTED RESPONSE:
❌ "Narrated by Muslim (Sahih)" ← FAIL! Where's the number?
❌ "Narrated by Bukhari" without number ← FAIL!

✅ ACCEPTED RESPONSE:
✅ Narrated by Muslim (2003)
✅ Narrated by Bukhari (5575) and Muslim (2003)
✅ ﴿...﴾ (Surah Al-Ma'idah, verse 90)

📚 HADITH DATABASE:
• Actions by intentions → Bukhari (1), Muslim (1907)
• Islam built on 5 → Bukhari (8), Muslim (16)
• Every intoxicant is khamr → Muslim (2003)
• Curse on alcohol → Abu Dawud (3674)
• Hadd for alcohol → Abu Dawud (4476)

Answer in English. Do NOT send response without numbered proofs!`
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// دالة التحقق وتحسين الإجابة
// ═══════════════════════════════════════════════════════════════════════════════
function validateAndEnhanceResponse(response, language, tier) {
  const analysis = ReferenceValidator.analyzeQuality(response);
  let enhancedResponse = response;
  const warnings = [];

  for (const warning of analysis.warnings) {
    warnings.push(warning[language] || warning.ar);
  }

  if (warnings.length > 0 && tier === 'premium') {
    const divider = '\n\n---\n';
    const note = language === 'ar' 
      ? '📚 يُنصح بمراجعة المصادر الأصلية للتأكد'
      : language === 'fr'
      ? '📚 Il est conseillé de vérifier les sources originales'
      : '📚 It is advised to verify original sources';
    
    enhancedResponse += divider + warnings.join('\n') + '\n' + note;
  }

  return { response: enhancedResponse, analysis, warnings };
}

// ═══════════════════════════════════════════════════════════════════════════════
// دالة حفظ المحادثة
// ═══════════════════════════════════════════════════════════════════════════════
async function saveConversation(userId, userMessage, assistantMessage, references) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let conversation = await prisma.conversation.findFirst({
      where: { userId: userId, createdAt: { gte: today } },
      orderBy: { updatedAt: 'desc' }
    });

    if (!conversation) {
      let title = userMessage.substring(0, 60);
      if (userMessage.length > 60) title += '...';
      
      conversation = await prisma.conversation.create({
        data: { userId: userId, title: title }
      });
    }

    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, role: 'user', content: userMessage },
        { conversationId: conversation.id, role: 'assistant', content: assistantMessage,
          references: references && references.length > 0 ? JSON.stringify(references) : null }
      ]
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return conversation.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Handler الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Clé API non configurée' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const rateLimitPassed = await withRateLimit(req, res, 'chat', 10, () => session.user.id);
  if (!rateLimitPassed) return;

  const { message, messages, language = 'ar', images = [] } = req.body;
  const userId = session.user.id;

  let userMessage;
  let conversationHistory = [];

  if (message) {
    userMessage = message;
  } else if (messages && Array.isArray(messages) && messages.length > 0) {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      userMessage = userMessages[userMessages.length - 1].content;
    }
    conversationHistory = messages.slice(-10);
  }

  if (!userMessage) {
    return res.status(400).json({ error: 'Message requis' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true, messageCount: true }
    });

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const currentTier = user.subscriptionTier || 'free';
    const messageLimit = currentTier === 'free' ? FREE_MESSAGE_LIMIT : 
                        currentTier === 'pro' ? PRO_MESSAGE_LIMIT : Infinity;

    if (user.messageCount >= messageLimit) {
      return res.status(403).json({ 
        error: 'Limite de messages atteinte',
        limit: messageLimit, current: user.messageCount, tier: currentTier
      });
    }

    const lang = ['ar', 'fr', 'en'].includes(language) ? language : 'ar';
    const systemPrompt = systemPrompts[lang][currentTier] || systemPrompts[lang].free;
    
    let maxTokens = currentTier === 'premium' ? 4000 : currentTier === 'pro' ? 2000 : 1000;

    // 🆕 Ajouter le rappel des références au message utilisateur
    const reminder = REFERENCE_REMINDER[lang] || REFERENCE_REMINDER.ar;
    
    const buildMessageContent = (text, attachedImages = []) => {
      if (!attachedImages || attachedImages.length === 0) return text;
      
      const content = [];
      for (const img of attachedImages) {
        if (img.data) {
          const base64Data = img.data.includes(',') ? img.data.split(',')[1] : img.data;
          content.push({
            type: 'image',
            source: { type: 'base64', media_type: img.mimeType || 'image/png', data: base64Data }
          });
        }
      }
      if (text) content.push({ type: 'text', text: text });
      return content;
    };
    
    let apiMessages;
    if (conversationHistory.length > 0) {
      apiMessages = conversationHistory.map((m, index) => {
        // 🆕 Pour le dernier message utilisateur, ajouter le rappel
        if (index === conversationHistory.length - 1 && m.role === 'user') {
          const contentWithReminder = m.content + reminder;
          if (images && images.length > 0) {
            return { role: m.role, content: buildMessageContent(contentWithReminder, images) };
          }
          return { role: m.role, content: contentWithReminder };
        }
        return { role: m.role, content: m.content };
      });
    } else {
      const messageWithReminder = userMessage + reminder;
      apiMessages = [{ role: 'user', content: buildMessageContent(messageWithReminder, images) }];
    }
    
    console.log(`Calling Anthropic API... (language: ${lang}, tier: ${currentTier})`);
    
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: apiMessages
    });

    let response = completion.content[0].text;

    // 🆕 Vérifier si la réponse contient des références - sinon re-demander
    const analysis = ReferenceValidator.analyzeQuality(response);
    const isReligiousQuestion = /حكم|حلال|حرام|صلاة|زكاة|صيام|خمر|ruling|permissible|prayer|alcohol|haram|halal/i.test(userMessage);
    
    if (isReligiousQuestion && !analysis.hasQuranRef && !analysis.hasHadithRef && analysis.validRefs.length === 0) {
      console.log('⚠️ Response missing references, requesting again...');
      
      const retryPrompt = {
        ar: 'أحتاج الأدلة من القرآن والسنة مع أرقام الأحاديث. أعد الإجابة مع: ﴿آية﴾ (سورة X: Y) وحديث: رواه مسلم (رقم).',
        fr: 'J\'ai besoin des preuves du Coran et de la Sunna avec les numéros. Reformule avec: ﴿verset﴾ (Sourate X:Y) et hadith: Muslim (numéro).',
        en: 'I need proofs from Quran and Sunnah with hadith numbers. Rephrase with: ﴿verse﴾ (Surah X:Y) and hadith: Muslim (number).'
      };
      
      const retryMessages = [
        ...apiMessages,
        { role: 'assistant', content: response },
        { role: 'user', content: retryPrompt[lang] || retryPrompt.ar }
      ];
      
      const retryCompletion = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: retryMessages
      });
      
      response = retryCompletion.content[0].text;
      console.log('✅ Got response with references (retry)');
    }

    const validation = validateAndEnhanceResponse(response, lang, currentTier);
    response = validation.response;

    const references = extractReferencesImproved(response);
    console.log('References found:', references.length);

    const conversationId = await saveConversation(userId, userMessage, response, references);

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { messageCount: { increment: 1 } }
      });
    } catch (dbError) {
      console.error('Error updating message count:', dbError);
    }

    return res.status(200).json({
      message: response,
      response: response,
      references: references,
      conversationId,
      messageCount: user.messageCount + 1,
      quality: {
        score: validation.analysis.score,
        validRefs: validation.analysis.validRefs.length,
        hasQuranRef: validation.analysis.hasQuranRef,
        hasHadithRef: validation.analysis.hasHadithRef
      },
      usage: {
        messagesUsed: user.messageCount + 1,
        messagesLimit: messageLimit,
        tier: currentTier
      }
    });

  } catch (error) {
    console.error('=== CHAT ERROR ===', error.message);
    
    if (error.status === 401) return res.status(500).json({ error: 'Erreur de configuration API' });
    if (error.status === 429) return res.status(429).json({ error: 'Trop de requêtes' });
    if (error.status === 400) return res.status(400).json({ error: 'Requête invalide' });
    
    return res.status(500).json({ error: 'Erreur serveur', debug: error.message });
  }
}
