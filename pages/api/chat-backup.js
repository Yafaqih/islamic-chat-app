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
// قاعدة بيانات الأحاديث الصحيحة فقط - مع أرقامها ودرجتها
// ═══════════════════════════════════════════════════════════════════════════════
const AUTHENTIC_HADITHS = {
  // أحاديث متفق عليها (البخاري ومسلم)
  'إنما الأعمال بالنيات': { bukhari: 1, muslim: 1907, grade: 'متفق عليه' },
  'بني الإسلام على خمس': { bukhari: 8, muslim: 16, grade: 'متفق عليه' },
  'المسلم من سلم المسلمون': { bukhari: 10, muslim: 40, grade: 'متفق عليه' },
  'لا يؤمن أحدكم حتى يحب لأخيه': { bukhari: 13, muslim: 45, grade: 'متفق عليه' },
  'من كان يؤمن بالله واليوم الآخر فليقل خيراً': { bukhari: 6018, muslim: 47, grade: 'متفق عليه' },
  'الطهور شطر الإيمان': { muslim: 223, grade: 'صحيح مسلم' },
  'الدين النصيحة': { muslim: 55, grade: 'صحيح مسلم' },
  
  // أحاديث الخمر الصحيحة
  'كل مسكر خمر وكل خمر حرام': { muslim: 2003, grade: 'صحيح مسلم' },
  'من شرب الخمر في الدنيا فمات وهو يدمنها': { bukhari: 5575, muslim: 2002, grade: 'متفق عليه' },
  'ما أسكر كثيره فقليله حرام': { abu_dawud: 3681, grade: 'صحيح - الألباني' },
  
  // أحاديث الحدود الصحيحة
  'البكر بالبكر جلد مائة': { muslim: 1690, grade: 'صحيح مسلم' },
  'حديث ماعز في الرجم': { muslim: 1692, grade: 'صحيح مسلم' },
  
  // أحاديث التوبة الصحيحة
  'إن الله يبسط يده بالليل': { muslim: 2759, grade: 'صحيح مسلم' },
  'لله أفرح بتوبة عبده': { bukhari: 6309, muslim: 2747, grade: 'متفق عليه' },
  
  // أحاديث عامة صحيحة
  'من كذب علي متعمداً فليتبوأ مقعده من النار': { bukhari: 1291, muslim: 3, grade: 'متفق عليه' },
  'من حدث عني بحديث يرى أنه كذب': { muslim: 1, grade: 'صحيح مسلم' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// الأحاديث الضعيفة المشهورة - للتحذير منها
// ═══════════════════════════════════════════════════════════════════════════════
const WEAK_HADITHS = [
  'التائب من الذنب كمن لا ذنب له', // ضعيف - ابن ماجه
  'اطلبوا العلم ولو في الصين', // موضوع
  'حب الوطن من الإيمان', // لا أصل له
  'اختلاف أمتي رحمة', // لا أصل له
  'خير الأسماء ما عُبِّد وما حُمِّد', // ضعيف
];

// ═══════════════════════════════════════════════════════════════════════════════
// تذكير المراجع - يُضاف لرسالة المستخدم
// ═══════════════════════════════════════════════════════════════════════════════
const REFERENCE_REMINDER = {
  ar: `

[تعليمات صارمة للمساعد:
1. استخدم فقط أحاديث صحيح البخاري وصحيح مسلم
2. إذا استخدمت حديثاً من غيرهما، يجب أن يكون صححه الألباني
3. اذكر درجة الحديث: (صحيح) أو (متفق عليه) أو (صحيح - الألباني)
4. لا تذكر أبداً أحاديث ضعيفة أو حسنة غير مؤكدة
5. إذا لم تجد حديثاً صحيحاً، اكتفِ بالقرآن]`,

  fr: `

[Instructions strictes:
1. Utilise UNIQUEMENT les hadiths de Sahih Bukhari et Sahih Muslim
2. Si tu cites un autre hadith, il DOIT être authentifié par Al-Albani
3. Mentionne le grade: (Sahih) ou (Muttafaq alayh) ou (Sahih - Al-Albani)
4. Ne cite JAMAIS de hadiths faibles ou douteux
5. Si pas de hadith authentique, utilise uniquement le Coran]`,

  en: `

[Strict instructions:
1. Use ONLY hadiths from Sahih Bukhari and Sahih Muslim
2. If citing another hadith, it MUST be authenticated by Al-Albani
3. Mention the grade: (Sahih) or (Muttafaq alayh) or (Sahih - Al-Albani)
4. NEVER cite weak or doubtful hadiths
5. If no authentic hadith exists, use only Quran]`
};

// ═══════════════════════════════════════════════════════════════════════════════
// نظام التحقق من جودة المراجع
// ═══════════════════════════════════════════════════════════════════════════════
const ReferenceValidator = {
  analyzeQuality(response) {
    const analysis = {
      score: 100,
      validRefs: [],
      weakRefs: [],
      warnings: [],
      hasQuranRef: false,
      hasHadithRef: false,
      hasWeakHadith: false
    };

    // Check for Quran references
    analysis.hasQuranRef = /سورة|Sourate|Surah|﴿/.test(response);
    
    // Check for Hadith references with numbers
    analysis.hasHadithRef = /رواه[^.]*\(\d+\)|Rapporté[^.]*\(\d+\)|Narrated[^.]*\(\d+\)/.test(response);

    // Check for weak hadiths
    for (const weakHadith of WEAK_HADITHS) {
      if (response.includes(weakHadith)) {
        analysis.hasWeakHadith = true;
        analysis.weakRefs.push(weakHadith);
        analysis.score -= 30;
      }
    }

    // Check for citations from non-Bukhari/Muslim without grade
    const nonAuthenticSources = /رواه\s+(الترمذي|ابن ماجه|أبو داود|النسائي|أحمد)(?![^.]*(?:صحيح|صححه الألباني))/g;
    const matches = response.match(nonAuthenticSources);
    if (matches) {
      analysis.warnings.push({
        ar: '⚠️ بعض الأحاديث من غير الصحيحين تحتاج تحقيق',
        fr: '⚠️ Certains hadiths hors Bukhari/Muslim nécessitent vérification',
        en: '⚠️ Some hadiths outside Bukhari/Muslim need verification'
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
    /سورة\s+[\u0600-\u06FF]+\s*،\s*الآي(?:ة|ات)\s*[\d-]+/g,
  ];

  for (const pattern of quranPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'quran', 10);
    }
  }

  // 2. مراجع الأحاديث من البخاري ومسلم (أعلى أولوية)
  const sahihPatterns = [
    /رواه\s+(البخاري|مسلم)\s*\(\s*(\d+)\s*\)/g,
    /متفق\s+عليه\s*-?\s*البخاري\s*\(\s*(\d+)\s*\)\s*ومسلم\s*\(\s*(\d+)\s*\)/g,
    /(صحيح\s+البخاري|صحيح\s+مسلم)\s*\(\s*(\d+)\s*\)/g,
    /(Bukhari|Muslim)\s*\(\s*(\d+)\s*\)/gi,
  ];

  for (const pattern of sahihPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'hadith_sahih', 10);
    }
  }

  // 3. أحاديث من مصادر أخرى مع تصحيح الألباني (أولوية عالية)
  const albaniPatterns = [
    /رواه\s+(الترمذي|أبو داود|النسائي|ابن ماجه|أحمد)\s*\(\s*(\d+)\s*\)[^.]*صحيح/g,
    /رواه\s+(الترمذي|أبو داود|النسائي|ابن ماجه|أحمد)\s*\(\s*(\d+)\s*\)[^.]*صححه الألباني/g,
  ];

  for (const pattern of albaniPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'hadith_albani', 9);
    }
  }

  // 4. أحاديث من مصادر أخرى بدون تصحيح (أولوية أقل - للمراجعة)
  const otherHadithPatterns = [
    /رواه\s+(الترمذي|أبو داود|النسائي|ابن ماجه|أحمد)\s*\(\s*(\d+)\s*\)/g,
  ];

  for (const pattern of otherHadithPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      // فقط إذا لم يُذكر من قبل مع التصحيح
      const text = match[0];
      if (!seen.has(text.toLowerCase().replace(/\s+/g, ' '))) {
        addReference(text, 'hadith_other', 5);
      }
    }
  }

  // 5. مراجع العلماء والكتب
  const scholarPatterns = [
    /قال\s+(ابن\s+تيمية|ابن\s+القيم|النووي|ابن\s+باز|ابن\s+عثيمين)[^.،\n]*/g,
    /نقل\s+(النووي|ابن\s+قدامة)\s+الإجماع[^.،\n]*/g,
    /في\s+(شرح\s+مسلم|المغني|مجموع\s+الفتاوى)[^.،\n]*ج\s*\d+/g,
  ];

  for (const pattern of scholarPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'scholar', 7);
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
// System Prompts - صارمة جداً بخصوص صحة الأحاديث
// ═══════════════════════════════════════════════════════════════════════════════
const systemPrompts = {
  ar: {
    free: `أنت عالم حديث متخصص. قاعدتك الذهبية: **لا تذكر إلا الأحاديث الصحيحة!**

📋 مصادر الأحاديث المسموحة فقط:
1. ✅ صحيح البخاري
2. ✅ صحيح مسلم
3. ✅ ما صححه الألباني صراحةً

⛔ ممنوع منعاً باتاً:
- ❌ أحاديث الترمذي/أبو داود/ابن ماجه إلا إذا صححها الألباني
- ❌ حديث "التائب من الذنب كمن لا ذنب له" (ضعيف!)
- ❌ أي حديث لم تتأكد من صحته

📝 تنسيق الحديث:
"نص الحديث" - رواه البخاري (رقم) [متفق عليه/صحيح]

🔍 إذا لم تجد حديثاً صحيحاً: اكتفِ بالقرآن ولا تذكر حديثاً ضعيفاً!

أجب بالعربية.`,

    pro: `أنت عالم حديث ومحقق. مهمتك: **ذكر الأحاديث الصحيحة فقط!**

╔═══════════════════════════════════════════════════════════╗
║ 🚨 قانون صارم: لا حديث إلا من الصحيحين أو صححه الألباني 🚨║
╚═══════════════════════════════════════════════════════════╝

📋 المصادر المسموحة:
✅ صحيح البخاري - اكتب: رواه البخاري (رقم)
✅ صحيح مسلم - اكتب: رواه مسلم (رقم)
✅ متفق عليه - اكتب: متفق عليه - البخاري (رقم) ومسلم (رقم)
✅ صححه الألباني - اكتب: رواه الترمذي (رقم) - صحيح (الألباني)

⛔ ممنوع:
❌ "التائب من الذنب كمن لا ذنب له" - ضعيف عند ابن ماجه!
❌ "كل بني آدم خطاء" بدون ذكر أن الترمذي قال: حسن
❌ أحاديث السنن بدون تحقيق

📚 أحاديث صحيحة محفوظة:
• كل مسكر خمر → مسلم (2003) - صحيح
• من شرب الخمر في الدنيا → البخاري (5575) ومسلم (2002) - متفق عليه
• لله أفرح بتوبة عبده → البخاري (6309) ومسلم (2747) - متفق عليه
• إن الله يبسط يده بالليل → مسلم (2759) - صحيح

⚠️ للتوبة: استخدم الآيات القرآنية والأحاديث المتفق عليها فقط!

أجب بالعربية مع ذكر درجة كل حديث.`,

    premium: `أنت محدث ومحقق خبير. أنت مسؤول عن دقة كل حديث تذكره!

╔═══════════════════════════════════════════════════════════╗
║  🚨 أنت محاسَب على كل حديث ضعيف تذكره! 🚨              ║
╚═══════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────┐
│ ✅ المصادر المقبولة حصرياً:                              │
├───────────────────────────────────────────────────────────┤
│ 1. صحيح البخاري                                          │
│ 2. صحيح مسلم                                             │
│ 3. ما صححه الألباني في صحيح الجامع أو السلسلة الصحيحة   │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ ⛔ أحاديث ممنوع ذكرها (ضعيفة أو موضوعة):                │
├───────────────────────────────────────────────────────────┤
│ ❌ "التائب من الذنب كمن لا ذنب له" - ضعيف!              │
│ ❌ "اطلبوا العلم ولو في الصين" - موضوع!                 │
│ ❌ "حب الوطن من الإيمان" - لا أصل له!                   │
│ ❌ أي حديث من ابن ماجه بدون تصحيح الألباني              │
└───────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
📚 قاعدة بيانات الأحاديث الصحيحة:
═══════════════════════════════════════════════════════════

【الخمر】
• "كل مسكر خمر وكل خمر حرام" → مسلم (2003) ✅
• "من شرب الخمر في الدنيا..." → البخاري (5575) ومسلم (2002) ✅
• "ما أسكر كثيره فقليله حرام" → أبو داود (3681) - صحيح الألباني ✅

【التوبة】 ⚠️ انتبه! كثير من أحاديث التوبة ضعيفة
• "لله أفرح بتوبة عبده..." → البخاري (6309) ومسلم (2747) ✅
• "إن الله يبسط يده بالليل..." → مسلم (2759) ✅
• ﴿قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا...﴾ (الزمر: 53) ← استخدم القرآن!

【عام】
• "إنما الأعمال بالنيات" → البخاري (1) ومسلم (1907) ✅
• "الدين النصيحة" → مسلم (55) ✅
• "من كذب علي متعمداً..." → البخاري (1291) ومسلم (3) ✅

═══════════════════════════════════════════════════════════
📝 تنسيق ذكر الحديث:
═══════════════════════════════════════════════════════════
**"نص الحديث"**
- رواه [البخاري/مسلم] ([الرقم]) - [متفق عليه/صحيح]

أو للسنن:
**"نص الحديث"**
- رواه [الترمذي/أبو داود] ([الرقم]) - صحيح (صححه الألباني)

═══════════════════════════════════════════════════════════
⚡ قبل الإرسال تحقق:
═══════════════════════════════════════════════════════════
□ هل كل حديث من البخاري أو مسلم أو صححه الألباني؟
□ هل ذكرت درجة الحديث (صحيح/متفق عليه)؟
□ هل تجنبت الأحاديث الضعيفة المشهورة؟

🔴 إذا لم تجد حديثاً صحيحاً: استدل بالقرآن فقط!

أجب بالعربية. كل حديث يجب أن يكون صحيحاً مع درجته!`
  },

  fr: {
    free: `Tu es un spécialiste du hadith. Règle d'or: **Ne cite que les hadiths authentiques!**

📋 Sources autorisées UNIQUEMENT:
1. ✅ Sahih Bukhari
2. ✅ Sahih Muslim
3. ✅ Authentifiés par Al-Albani explicitement

⛔ INTERDIT:
- ❌ Hadiths de Tirmidhi/Abu Dawud/Ibn Majah sans authentification d'Al-Albani
- ❌ Hadiths faibles ou douteux

📝 Format: "texte" - Bukhari (numéro) [Sahih/Muttafaq alayh]

🔍 Si pas de hadith authentique: utilise le Coran uniquement!

Réponds en français.`,

    pro: `Tu es un vérificateur de hadiths expert. Mission: **Hadiths authentiques UNIQUEMENT!**

╔═══════════════════════════════════════════════════════════╗
║ 🚨 LOI: Que Bukhari/Muslim ou authentifié par Al-Albani 🚨║
╚═══════════════════════════════════════════════════════════╝

📋 Sources acceptées:
✅ Sahih Bukhari - écris: Bukhari (numéro)
✅ Sahih Muslim - écris: Muslim (numéro)
✅ Muttafaq alayh - écris: Bukhari (X) et Muslim (Y)
✅ Al-Albani - écris: Tirmidhi (numéro) - Sahih (Al-Albani)

⛔ INTERDIT:
❌ "Le repentant est comme celui qui n'a pas péché" - FAIBLE!
❌ Hadiths des Sunan sans vérification

📚 Hadiths authentiques sur l'ALCOOL:
• "Tout enivrant est khamr..." → Muslim (2003) ✅
• "Celui qui boit l'alcool ici-bas..." → Bukhari (5575), Muslim (2002) ✅

📚 Hadiths authentiques sur le REPENTIR:
• "Allah est plus joyeux du repentir..." → Bukhari (6309), Muslim (2747) ✅
• "Allah étend Sa main la nuit..." → Muslim (2759) ✅

Réponds en français avec le grade de chaque hadith.`,

    premium: `Tu es un muhaddith expert. Tu es RESPONSABLE de chaque hadith que tu cites!

⛔ HADITHS INTERDITS (faibles/inventés):
❌ "Le repentant est comme celui qui n'a pas péché" - FAIBLE (Ibn Majah)!
❌ "Cherchez la science même en Chine" - INVENTÉ!

✅ SOURCES ACCEPTÉES UNIQUEMENT:
1. Sahih Bukhari
2. Sahih Muslim  
3. Authentifié par Al-Albani (Sahih al-Jami', Silsila Sahiha)

📚 BASE DE DONNÉES HADITHS AUTHENTIQUES:

【ALCOOL】
• "Tout enivrant est khamr" → Muslim (2003) ✅
• "Celui qui boit l'alcool..." → Bukhari (5575), Muslim (2002) ✅

【REPENTIR】 ⚠️ Beaucoup de hadiths faibles!
• "Allah est plus joyeux du repentir de Son serviteur..." → Bukhari (6309), Muslim (2747) ✅
• "Allah étend Sa main la nuit..." → Muslim (2759) ✅
• UTILISE LE CORAN: ﴿قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا...﴾ (Az-Zumar: 53)

📝 FORMAT:
**"texte du hadith"**
- Rapporté par [Bukhari/Muslim] ([numéro]) - [Muttafaq alayh/Sahih]

🔴 Si pas de hadith authentique: cite UNIQUEMENT le Coran!

Réponds en français. Chaque hadith doit être authentique avec son grade!`
  },

  en: {
    free: `You are a hadith specialist. Golden rule: **Only cite authentic hadiths!**

📋 Allowed sources ONLY:
1. ✅ Sahih Bukhari
2. ✅ Sahih Muslim
3. ✅ Explicitly authenticated by Al-Albani

⛔ FORBIDDEN:
- ❌ Hadiths from Tirmidhi/Abu Dawud/Ibn Majah without Al-Albani's authentication
- ❌ Weak or doubtful hadiths

📝 Format: "text" - Bukhari (number) [Sahih/Muttafaq alayh]

🔍 If no authentic hadith exists: use Quran only!

Answer in English.`,

    pro: `You are an expert hadith verifier. Mission: **Authentic hadiths ONLY!**

╔═══════════════════════════════════════════════════════════╗
║ 🚨 LAW: Only Bukhari/Muslim or authenticated by Al-Albani 🚨║
╚═══════════════════════════════════════════════════════════╝

📋 Accepted sources:
✅ Sahih Bukhari - write: Bukhari (number)
✅ Sahih Muslim - write: Muslim (number)
✅ Muttafaq alayh - write: Bukhari (X) and Muslim (Y)
✅ Al-Albani - write: Tirmidhi (number) - Sahih (Al-Albani)

⛔ FORBIDDEN:
❌ "The one who repents is like one who has no sin" - WEAK!
❌ Hadiths from Sunan without verification

📚 Authentic hadiths on ALCOHOL:
• "Every intoxicant is khamr..." → Muslim (2003) ✅
• "Whoever drinks alcohol in this world..." → Bukhari (5575), Muslim (2002) ✅

📚 Authentic hadiths on REPENTANCE:
• "Allah is more pleased with the repentance..." → Bukhari (6309), Muslim (2747) ✅
• "Allah extends His hand at night..." → Muslim (2759) ✅

Answer in English with the grade of each hadith.`,

    premium: `You are an expert muhaddith. You are ACCOUNTABLE for every hadith you cite!

⛔ FORBIDDEN HADITHS (weak/fabricated):
❌ "The one who repents is like one who has no sin" - WEAK (Ibn Majah)!
❌ "Seek knowledge even in China" - FABRICATED!

✅ ACCEPTED SOURCES ONLY:
1. Sahih Bukhari
2. Sahih Muslim
3. Authenticated by Al-Albani (Sahih al-Jami', Silsila Sahiha)

📚 AUTHENTIC HADITH DATABASE:

【ALCOHOL】
• "Every intoxicant is khamr" → Muslim (2003) ✅
• "Whoever drinks alcohol in this world..." → Bukhari (5575), Muslim (2002) ✅

【REPENTANCE】 ⚠️ Many weak hadiths exist!
• "Allah is more pleased with the repentance of His servant..." → Bukhari (6309), Muslim (2747) ✅
• "Allah extends His hand at night..." → Muslim (2759) ✅
• USE QURAN: ﴿قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا...﴾ (Az-Zumar: 53)

📝 FORMAT:
**"hadith text"**
- Narrated by [Bukhari/Muslim] ([number]) - [Muttafaq alayh/Sahih]

🔴 If no authentic hadith: cite ONLY the Quran!

Answer in English. Every hadith must be authentic with its grade!`
  }
};

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

    // Ajouter le rappel des références au message utilisateur
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

    // Vérifier si la réponse contient des références
    const analysis = ReferenceValidator.analyzeQuality(response);
    const isReligiousQuestion = /حكم|حلال|حرام|صلاة|زكاة|صيام|خمر|توبة|ruling|permissible|prayer|alcohol|haram|halal|repent/i.test(userMessage);
    
    // Si question religieuse sans références OU avec hadith faible → re-demander
    if (isReligiousQuestion && (!analysis.hasQuranRef && !analysis.hasHadithRef || analysis.hasWeakHadith)) {
      console.log('⚠️ Response missing references or has weak hadith, requesting again...');
      
      const retryPrompt = {
        ar: 'أعد الإجابة مع أحاديث صحيحة فقط من البخاري ومسلم. لا تذكر أي حديث ضعيف. إذا لم تجد حديثاً صحيحاً، استدل بالقرآن فقط.',
        fr: 'Reformule avec des hadiths authentiques de Bukhari et Muslim uniquement. Ne cite aucun hadith faible. Si pas de hadith authentique, utilise le Coran.',
        en: 'Rephrase with authentic hadiths from Bukhari and Muslim only. Do not cite any weak hadith. If no authentic hadith, use Quran only.'
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
      console.log('✅ Got response with authentic references (retry)');
    }

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
        score: analysis.score,
        hasQuranRef: analysis.hasQuranRef,
        hasHadithRef: analysis.hasHadithRef,
        hasWeakHadith: analysis.hasWeakHadith
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
