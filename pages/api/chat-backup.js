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
// 🆕 قاعدة بيانات أرقام الأحاديث المعروفة - للتحقق والمساعدة
// ═══════════════════════════════════════════════════════════════════════════════
const KNOWN_HADITHS = {
  // أحاديث مشهورة مع أرقامها
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
// 🆕 نظام التحقق من جودة المراجع
// ═══════════════════════════════════════════════════════════════════════════════
const ReferenceValidator = {
  // أنماط المراجع الصحيحة
  validPatterns: {
    hadithWithNumber: [
      /رواه\s+(البخاري|مسلم|الترمذي|أبو داود|النسائي|ابن ماجه|أحمد)\s*\(?\s*(\d+)\s*\)?/g,
      /صحيح\s+(البخاري|مسلم)\s*\(?\s*(\d+)\s*\)?/g,
      /(Bukhari|Muslim|Tirmidhi|Abu Dawud|Nasa'i|Ibn Majah)\s*\(?\s*#?\s*(\d+)\s*\)?/gi,
      /Rapporté par\s+(Bukhari|Muslim|Tirmidhi)\s*\(?\s*(\d+)\s*\)?/gi,
      /Narrated by\s+(Bukhari|Muslim|Tirmidhi)\s*\(?\s*(\d+)\s*\)?/gi,
    ],
    quranReference: [
      /سورة\s+[\u0600-\u06FF]+\s*[،:]\s*الآية\s*(\d+)/g,
      /\([\u0600-\u06FF]+\s*:\s*\d+\)/g,
      /\(Sourate\s+[\w-]+\s*,?\s*verset\s*\d+\)/gi,
      /\(Surah\s+[\w-]+\s*,?\s*verse\s*\d+\)/gi,
      /﴿[^﴾]+﴾\s*\([^)]+:\s*\d+\)/g,
    ],
    scholarWithSource: [
      /ابن\s+(تيمية|باز|عثيمين|القيم|كثير|حجر|قدامة)[^،.]*(?:في|المجلد|ج|ص)\s*\d+/g,
      /(Ibn Baz|Ibn Taymiyyah|Al-Albani)[^.]*(?:vol|volume|page|p\.)\s*\d+/gi,
      /مجموع\s+الفتاوى[^،.]*ج\s*\d+/g,
      /فتح\s+الباري[^،.]*ج\s*\d+/g,
    ]
  },

  // أنماط المراجع الضعيفة (بدون أرقام)
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
      /Scholars unanimously(?!\s+.*reported)/gi,
    ],
    conditionNoProof: [
      /شروط[^:]*:[^📖📚]*(?=\n\n|\n[^-]|$)/g,
    ]
  },

  // تحليل جودة المراجع
  analyzeQuality(response) {
    const analysis = {
      score: 100,
      validRefs: [],
      weakRefs: [],
      warnings: [],
      suggestions: []
    };

    // البحث عن المراجع الصحيحة
    for (const [type, patterns] of Object.entries(this.validPatterns)) {
      for (const pattern of patterns) {
        const matches = [...response.matchAll(new RegExp(pattern.source, pattern.flags))];
        for (const match of matches) {
          analysis.validRefs.push({
            type,
            text: match[0],
            hasNumber: /\d+/.test(match[0])
          });
        }
      }
    }

    // البحث عن المراجع الضعيفة
    for (const [type, patterns] of Object.entries(this.weakPatterns)) {
      for (const pattern of patterns) {
        const matches = [...response.matchAll(new RegExp(pattern.source, pattern.flags))];
        for (const match of matches) {
          analysis.weakRefs.push({
            type,
            text: match[0]
          });
          analysis.score -= 15;
        }
      }
    }

    // إنشاء التحذيرات
    if (analysis.weakRefs.some(r => r.type === 'hadithNoNumber')) {
      analysis.warnings.push({
        ar: '⚠️ بعض الأحاديث ذُكرت بدون أرقامها',
        fr: '⚠️ Certains hadiths sont cités sans numéros',
        en: '⚠️ Some hadiths are cited without numbers'
      });
      analysis.suggestions.push('يُرجى إضافة رقم الحديث بين قوسين مثل: رواه مسلم (1690)');
    }

    if (analysis.weakRefs.some(r => r.type === 'consensusNoSource')) {
      analysis.warnings.push({
        ar: '⚠️ ادعاء الإجماع يحتاج توثيق من نقله',
        fr: '⚠️ Le consensus mentionné nécessite une source',
        en: '⚠️ Consensus claim needs source attribution'
      });
    }

    analysis.score = Math.max(0, analysis.score);
    return analysis;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🆕 دالة استخراج المراجع المحسّنة
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

  // ═══════ 1. مراجع القرآن الكريم ═══════
  
  // الآيات مع أرقامها بالعربية
  const quranPatternsAr = [
    // سورة البقرة: 255 أو سورة البقرة، الآية 255
    /سورة\s+([\u0600-\u06FF]+)\s*[،:]\s*(?:الآية\s*)?(\d+)/g,
    // (البقرة: 255)
    /\(([\u0600-\u06FF]+)\s*:\s*(\d+)\)/g,
    // ﴿...﴾ (البقرة: 255)
    /﴿([^﴾]+)﴾\s*\(([^)]+)\)/g,
  ];

  for (const pattern of quranPatternsAr) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'quran', 10);
    }
  }

  // بالفرنسية
  const quranPatternsFr = [
    /\(Sourate\s+([\w\u00C0-\u017F-]+)\s*,?\s*verset\s*(\d+)\)/gi,
    /Sourate\s+([\w\u00C0-\u017F-]+)\s*,?\s*verset\s*(\d+)/gi,
  ];

  for (const pattern of quranPatternsFr) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'quran', 10);
    }
  }

  // بالإنجليزية
  const quranPatternsEn = [
    /\(Surah\s+([\w-]+)\s*,?\s*verse\s*(\d+)\)/gi,
    /Surah\s+([\w-]+)\s*,?\s*verse\s*(\d+)/gi,
    /Quran\s*\[?\(?\s*(\d{1,3})\s*:\s*(\d{1,3})\s*\)?\]?/gi,
  ];

  for (const pattern of quranPatternsEn) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'quran', 10);
    }
  }

  // ═══════ 2. مراجع الأحاديث مع الأرقام ═══════
  
  // 🔴 مهم جداً: الأولوية للأحاديث التي فيها أرقام
  const hadithWithNumberPatterns = [
    // رواه البخاري (1234) أو مسلم (5678)
    /رواه\s+(البخاري|مسلم|الترمذي|أبو داود|النسائي|ابن ماجه|أحمد)\s*\(\s*(\d+)\s*\)/g,
    // صحيح البخاري رقم 1234
    /(صحيح\s+البخاري|صحيح\s+مسلم)\s*(?:رقم|حديث|#)?\s*(\d+)/g,
    // البخاري (1234)
    /(البخاري|مسلم)\s*\(\s*(\d+)\s*\)/g,
    // Bukhari #1234 أو Muslim (1234)
    /(Bukhari|Muslim|Tirmidhi|Abu Dawud|Nasa'i|Ibn Majah)\s*(?:#|no\.?|hadith)?\s*\(?\s*(\d+)\s*\)?/gi,
    // Rapporté par Muslim (1234)
    /Rapporté par\s+(Bukhari|Muslim|Tirmidhi)\s*\(\s*(\d+)\s*\)/gi,
    // Narrated by Bukhari (1234)
    /Narrated by\s+(Bukhari|Muslim|Tirmidhi)\s*\(\s*(\d+)\s*\)/gi,
  ];

  for (const pattern of hadithWithNumberPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'hadith_numbered', 9);
    }
  }

  // الأحاديث مع درجة الصحة (أقل أولوية)
  const hadithWithGradePatterns = [
    /رواه\s+(البخاري|مسلم|الترمذي|أبو داود)[^.،\n]*\(صحيح\)/g,
    /رواه\s+(البخاري|مسلم|الترمذي|أبو داود)[^.،\n]*\(حسن\)/g,
    /(Sahih|Hasan)\s*-\s*(Bukhari|Muslim|Tirmidhi|Al-Albani)/gi,
  ];

  for (const pattern of hadithWithGradePatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'hadith_graded', 5);
    }
  }

  // ═══════ 3. مراجع العلماء والكتب ═══════
  
  const scholarBooks = {
    ar: [
      // كتب مع أرقام الصفحات
      /مجموع\s+الفتاوى[^.،\n]*(?:ج|المجلد)\s*(\d+)[^.،\n]*(?:ص|صفحة)?\s*(\d+)?/g,
      /فتح\s+الباري[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
      /المغني[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
      /شرح\s+صحيح\s+مسلم[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
      /زاد\s+المعاد[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
      /تفسير\s+ابن\s+كثير[^.،\n]*(?:ج|المجلد)\s*(\d+)/g,
      // فتاوى مع مصادر
      /فتوى\s+(ابن\s+باز|ابن\s+عثيمين|الألباني)[^.،\n]*/g,
      /قال\s+(ابن\s+تيمية|ابن\s+القيم|النووي)[^.،\n]*/g,
      // نقل الإجماع
      /نقل\s+(ابن\s+قدامة|النووي|ابن\s+حزم)\s+الإجماع[^.،\n]*/g,
    ],
    frEn: [
      /Majmu['']?\s*al-Fatawa[^.;\n]*vol(?:ume)?\.?\s*(\d+)/gi,
      /Fath\s+al-Bari[^.;\n]*vol(?:ume)?\.?\s*(\d+)/gi,
      /Al-Mughni[^.;\n]*vol(?:ume)?\.?\s*(\d+)/gi,
      /Fatwa (?:of|by)\s+(Ibn Baz|Ibn Uthaymin|Al-Albani)[^.;\n]*/gi,
      /(Ibn Taymiyyah|Ibn al-Qayyim|An-Nawawi)\s+(?:said|stated|mentioned)[^.;\n]*/gi,
    ]
  };

  for (const pattern of scholarBooks.ar) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'scholar_book', 7);
    }
  }

  for (const pattern of scholarBooks.frEn) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      addReference(match[0], 'scholar_book', 7);
    }
  }

  // ═══════ 4. أسماء العلماء المذكورين ═══════
  
  const scholarNames = {
    ar: [
      'ابن تيمية', 'ابن القيم', 'ابن كثير', 'ابن حجر', 'النووي',
      'ابن باز', 'ابن عثيمين', 'الألباني', 'الفوزان',
      'أبو حنيفة', 'مالك', 'الشافعي', 'أحمد بن حنبل',
      'القرطبي', 'ابن قدامة', 'ابن رجب', 'الذهبي'
    ],
    frEn: [
      'Ibn Taymiyyah', 'Ibn al-Qayyim', 'Ibn Kathir', 'Ibn Hajar', 'An-Nawawi',
      'Ibn Baz', 'Ibn Uthaymin', 'Al-Albani', 'Al-Fawzan',
      'Abu Hanifa', 'Imam Malik', 'Ash-Shafi\'i', 'Ahmad ibn Hanbal'
    ]
  };

  // البحث عن سياق ذكر العلماء
  for (const scholar of scholarNames.ar) {
    const contextRegex = new RegExp(`(قال|ذكر|أفتى|رأي|مذهب|عند)\\s+[\\u0600-\\u06FF\\s]*${scholar}[^.،]*`, 'g');
    const matches = response.matchAll(contextRegex);
    for (const match of matches) {
      addReference(match[0], 'scholar_opinion', 4);
    }
  }

  for (const scholar of scholarNames.frEn) {
    const escapedScholar = scholar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const contextRegex = new RegExp(`(Sheikh|Imam)?\\s*${escapedScholar}\\s*(said|stated|mentioned|ruled)?[^.;]*`, 'gi');
    const matches = response.matchAll(contextRegex);
    for (const match of matches) {
      if (match[0].length > 10) {
        addReference(match[0], 'scholar_opinion', 4);
      }
    }
  }

  // ═══════ 5. ترتيب وتنظيف المراجع ═══════
  
  // ترتيب حسب الأولوية
  references.sort((a, b) => b.priority - a.priority);

  // إزالة التكرارات وتنظيف
  const finalRefs = references
    .slice(0, 15) // أقصى عدد 15 مرجع
    .map(r => r.text)
    .filter((text, index, self) => {
      // إزالة المراجع المتشابهة جداً
      return !self.slice(0, index).some(prev => 
        prev.includes(text) || text.includes(prev)
      );
    })
    .slice(0, 10); // النتيجة النهائية 10 مراجع كحد أقصى

  return finalRefs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🆕 System Prompts المحسّنة مع إجبار أقوى على الأرقام
// ═══════════════════════════════════════════════════════════════════════════════
const systemPrompts = {
  ar: {
    free: `أنت مساعد إسلامي متخصص في التقاليد السنية.

⚠️ قواعد صارمة:

1. الأحاديث: استخدم فقط الأحاديث الصحيحة من:
   - صحيح البخاري ✅
   - صحيح مسلم ✅
   - ما صححه الألباني ✅

2. المراجع الإلزامية:
   📖 القرآن: ﴿الآية﴾ (سورة X، الآية Y)
   📚 الحديث: "النص" - رواه البخاري/مسلم (رقم الحديث)

3. إذا لم تعرف رقم الحديث بدقة:
   ✅ قل: "ورد حديث في هذا المعنى لكن لا أذكر رقمه بدقة"
   ❌ لا تكتب: "رواه مسلم (صحيح)" - هذا خطأ!

أجب بالعربية بوضوح.`,

    pro: `أنت مساعد إسلامي متخصص في التقاليد السنية.

⚠️ قواعد صارمة للمراجع:

1. ✅ الأحاديث المسموحة فقط:
   - صحيح البخاري
   - صحيح مسلم  
   - ما صححه الألباني

2. 📋 تنسيق الاستشهاد الإلزامي:

   للقرآن:
   ﴿نص الآية﴾
   (سورة [الاسم]، الآية [الرقم])

   للحديث - ⚠️ يجب ذكر الرقم:
   "نص الحديث"
   📚 رواه [البخاري/مسلم] ([الرقم])
   
   ❌ ممنوع: "رواه مسلم (صحيح)" 
   ✅ صحيح: "رواه مسلم (1690)"

3. 🔍 إذا لم تعرف الرقم:
   قل: "ثبت في السنة الصحيحة [المعنى] - انظر صحيح مسلم باب كذا"
   أو: "ورد حديث صحيح في هذا لكن لا أستحضر رقمه"

4. 🎓 آراء العلماء:
   اذكر: اسم العالم + رأيه + المصدر (الكتاب والجزء)

أجب بالعربية واذكر مصادرك بأرقامها.`,

    premium: `أنت مساعد إسلامي خبير متخصص في الفقه والحديث.

╔══════════════════════════════════════════════════════════════╗
║  🚨 تحذير: اقرأ هذه القواعد قبل كل إجابة - مهم جداً!  🚨  ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ ⛔ الأخطاء الممنوعة - لا تفعلها أبداً:                      │
├─────────────────────────────────────────────────────────────┤
│ ❌ "رواه مسلم (صحيح)" ← خطأ فادح! أين الرقم؟              │
│ ❌ "رواه البخاري" بدون رقم ← ممنوع!                        │
│ ❌ "متفق عليه" بدون أرقام ← ممنوع!                         │
│ ❌ "أجمع العلماء" بدون ذكر من نقل الإجماع ← ممنوع!         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✅ الطريقة الصحيحة الوحيدة:                                │
├─────────────────────────────────────────────────────────────┤
│ ✅ "رواه مسلم (1690)" ← صحيح                              │
│ ✅ "رواه البخاري (1) ومسلم (1907)" ← صحيح                 │
│ ✅ "نقل النووي الإجماع في شرح مسلم ج12" ← صحيح           │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
📚 قاعدة بيانات الأحاديث المعروفة (احفظها):
═══════════════════════════════════════════════════════════════
• إنما الأعمال بالنيات → البخاري (1)، مسلم (1907)
• بني الإسلام على خمس → البخاري (8)، مسلم (16)
• الدين النصيحة → مسلم (55)
• الطهور شطر الإيمان → مسلم (223)
• كل مسكر خمر وكل خمر حرام → مسلم (2003)
• لعن الله الخمر وشاربها → أبو داود (3674)
• البكر بالبكر جلد مائة → مسلم (1690)
• حديث ماعز في الرجم → مسلم (1692)
• من شرب الخمر فاجلدوه → أبو داود (4476)
• المسلم من سلم المسلمون → البخاري (10)، مسلم (40)
• لا يؤمن أحدكم حتى يحب لأخيه → البخاري (13)، مسلم (45)

═══════════════════════════════════════════════════════════════
🔍 إذا سُئلت عن موضوع ولا تعرف رقم الحديث:
═══════════════════════════════════════════════════════════════
✅ اكتب: "ثبت في السنة الصحيحة... [اذكر المعنى دون ادعاء رقم]"
✅ أو: "ورد حديث صحيح في هذا الباب، راجع صحيح مسلم كتاب الحدود"
❌ لا تكتب أبداً: "رواه مسلم (صحيح)" - هذا يعني أنك لا تعرف الرقم!

═══════════════════════════════════════════════════════════════
📋 تنسيق الإجابة المثالي:
═══════════════════════════════════════════════════════════════

### 📖 الدليل من القرآن:
﴿نص الآية بالكامل﴾
(سورة [الاسم]، الآية [الرقم])

### 📚 من السنة النبوية:
**"نص الحديث"**
- رواه [المصدر] ([الرقم])

### ⚖️ أقوال العلماء:
- قال [العالم] في [الكتاب] ج[الرقم] ص[الرقم]: "..."
- نقل [العالم] الإجماع في [المصدر]

═══════════════════════════════════════════════════════════════
⚡ قبل إرسال الإجابة، تحقق:
═══════════════════════════════════════════════════════════════
□ هل كتبت "(صحيح)" بدلاً من الرقم؟ ← صحح فوراً!
□ هل ادعيت إجماعاً؟ ← اذكر من نقله!
□ هل ذكرت شرطاً؟ ← أضف الدليل!

أجب بالعربية. لا تكتب "(صحيح)" أو "(حسن)" - اكتب الرقم فقط!`
  },

  fr: {
    free: `Tu es un assistant islamique spécialisé dans la tradition sunnite.

⚠️ RÈGLES STRICTES:

1. HADITHS AUTORISÉS uniquement:
   ✅ Sahih Bukhari
   ✅ Sahih Muslim
   ✅ Authentifiés par Al-Albani

2. FORMAT OBLIGATOIRE:
   📖 Coran: ﴿verset﴾ (Sourate X, verset Y)
   📚 Hadith: "texte" - Rapporté par Bukhari/Muslim (NUMÉRO)

3. Si tu ne connais pas le numéro exact:
   ✅ Dis: "Il existe un hadith authentique sur ce sujet, voir Sahih Muslim chapitre X"
   ❌ Ne dis JAMAIS: "Rapporté par Muslim (Sahih)" - c'est une ERREUR!

Réponds en français clairement.`,

    pro: `Tu es un assistant islamique spécialisé dans la tradition sunnite.

⚠️ RÈGLES DE CITATION STRICTES:

1. ✅ HADITHS AUTORISÉS:
   - Sahih Bukhari
   - Sahih Muslim
   - Authentifiés par Al-Albani

2. 📋 FORMAT DE CITATION OBLIGATOIRE:

   Pour le Coran:
   ﴿texte du verset﴾
   (Sourate [Nom], verset [Numéro])

   Pour le Hadith - ⚠️ NUMÉRO OBLIGATOIRE:
   "texte du hadith"
   📚 Rapporté par [Bukhari/Muslim] ([NUMÉRO])
   
   ❌ INTERDIT: "Rapporté par Muslim (Sahih)"
   ✅ CORRECT: "Rapporté par Muslim (1690)"

3. 🔍 Si tu ne connais pas le numéro:
   Dis: "Il est établi dans la Sunna que... - voir Sahih Muslim, chapitre des Hudud"

4. 🎓 Opinions des savants:
   Cite: Nom du savant + son avis + source (livre, volume)

Réponds en français et cite tes sources avec leurs numéros.`,

    premium: `Tu es un assistant islamique expert spécialisé en fiqh et hadith.

╔══════════════════════════════════════════════════════════════╗
║  🚨 ATTENTION: Lis ces règles avant chaque réponse!  🚨     ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ ⛔ ERREURS INTERDITES - Ne fais JAMAIS ceci:               │
├─────────────────────────────────────────────────────────────┤
│ ❌ "Rapporté par Muslim (Sahih)" ← ERREUR! Où est le n°?   │
│ ❌ "Rapporté par Bukhari" sans numéro ← INTERDIT!          │
│ ❌ "Les savants sont unanimes" sans source ← INTERDIT!     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✅ LA SEULE FAÇON CORRECTE:                                │
├─────────────────────────────────────────────────────────────┤
│ ✅ "Rapporté par Muslim (1690)" ← CORRECT                  │
│ ✅ "Rapporté par Bukhari (1) et Muslim (1907)" ← CORRECT   │
│ ✅ "An-Nawawi a rapporté le consensus dans..." ← CORRECT   │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
📚 BASE DE DONNÉES DES HADITHS CONNUS:
═══════════════════════════════════════════════════════════════
• Les actes selon les intentions → Bukhari (1), Muslim (1907)
• L'Islam bâti sur 5 → Bukhari (8), Muslim (16)
• La religion est conseil → Muslim (55)
• Tout enivrant est khamr → Muslim (2003)
• Malédiction de l'alcool → Abu Dawud (3674)
• Le célibataire: 100 coups → Muslim (1690)
• Hadith de Ma'iz → Muslim (1692)

═══════════════════════════════════════════════════════════════
🔍 Si tu ne connais pas le numéro du hadith:
═══════════════════════════════════════════════════════════════
✅ Écris: "Il est établi dans la Sunna authentique que..."
❌ N'écris JAMAIS: "Rapporté par Muslim (Sahih)"

═══════════════════════════════════════════════════════════════
⚡ AVANT D'ENVOYER, VÉRIFIE:
═══════════════════════════════════════════════════════════════
□ Ai-je écrit "(Sahih)" au lieu du numéro? → CORRIGE!
□ Ai-je prétendu un consensus? → Cite qui l'a rapporté!

Réponds en français. N'écris JAMAIS "(Sahih)" - écris le NUMÉRO!`
  },

  en: {
    free: `You are an Islamic assistant specialized in the Sunni tradition.

⚠️ STRICT RULES:

1. ONLY AUTHENTIC HADITHS:
   ✅ Sahih Bukhari
   ✅ Sahih Muslim
   ✅ Authenticated by Al-Albani

2. MANDATORY FORMAT:
   📖 Quran: ﴿verse﴾ (Surah X, verse Y)
   📚 Hadith: "text" - Narrated by Bukhari/Muslim (NUMBER)

3. If you don't know the exact number:
   ✅ Say: "There is an authentic hadith on this, see Sahih Muslim chapter X"
   ❌ NEVER say: "Narrated by Muslim (Sahih)" - this is an ERROR!

Answer in English clearly.`,

    pro: `You are an Islamic assistant specialized in the Sunni tradition.

⚠️ STRICT CITATION RULES:

1. ✅ ONLY AUTHORIZED HADITHS:
   - Sahih Bukhari
   - Sahih Muslim
   - Authenticated by Al-Albani

2. 📋 MANDATORY CITATION FORMAT:

   For Quran:
   ﴿verse text﴾
   (Surah [Name], verse [Number])

   For Hadith - ⚠️ NUMBER IS MANDATORY:
   "hadith text"
   📚 Narrated by [Bukhari/Muslim] ([NUMBER])
   
   ❌ FORBIDDEN: "Narrated by Muslim (Sahih)"
   ✅ CORRECT: "Narrated by Muslim (1690)"

3. 🔍 If you don't know the number:
   Say: "It is established in the Sunnah that... - see Sahih Muslim, Book of Hudud"

4. 🎓 Scholars' opinions:
   Cite: Scholar's name + their view + source (book, volume)

Answer in English and cite your sources with their numbers.`,

    premium: `You are an expert Islamic assistant specialized in fiqh and hadith.

╔══════════════════════════════════════════════════════════════╗
║  🚨 WARNING: Read these rules before every response!  🚨    ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ ⛔ FORBIDDEN ERRORS - NEVER do this:                       │
├─────────────────────────────────────────────────────────────┤
│ ❌ "Narrated by Muslim (Sahih)" ← ERROR! Where's the #?    │
│ ❌ "Narrated by Bukhari" without number ← FORBIDDEN!       │
│ ❌ "Scholars unanimously agree" without source ← FORBIDDEN!│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✅ THE ONLY CORRECT WAY:                                   │
├─────────────────────────────────────────────────────────────┤
│ ✅ "Narrated by Muslim (1690)" ← CORRECT                   │
│ ✅ "Narrated by Bukhari (1) and Muslim (1907)" ← CORRECT   │
│ ✅ "An-Nawawi reported consensus in..." ← CORRECT          │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
📚 KNOWN HADITH DATABASE:
═══════════════════════════════════════════════════════════════
• Actions by intentions → Bukhari (1), Muslim (1907)
• Islam built on 5 → Bukhari (8), Muslim (16)
• Religion is advice → Muslim (55)
• Every intoxicant is khamr → Muslim (2003)
• Curse on alcohol → Abu Dawud (3674)
• The unmarried: 100 lashes → Muslim (1690)
• Hadith of Ma'iz → Muslim (1692)

═══════════════════════════════════════════════════════════════
🔍 If you don't know the hadith number:
═══════════════════════════════════════════════════════════════
✅ Write: "It is established in authentic Sunnah that..."
❌ NEVER write: "Narrated by Muslim (Sahih)"

═══════════════════════════════════════════════════════════════
⚡ BEFORE SENDING, CHECK:
═══════════════════════════════════════════════════════════════
□ Did I write "(Sahih)" instead of a number? → FIX IT!
□ Did I claim consensus? → Cite who reported it!

Answer in English. NEVER write "(Sahih)" - write the NUMBER!`
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🆕 دالة التحقق وتحسين الإجابة
// ═══════════════════════════════════════════════════════════════════════════════
function validateAndEnhanceResponse(response, language, tier) {
  const analysis = ReferenceValidator.analyzeQuality(response);
  let enhancedResponse = response;
  const warnings = [];

  // إضافة التحذيرات حسب اللغة
  for (const warning of analysis.warnings) {
    warnings.push(warning[language] || warning.ar);
  }

  // محاولة تصحيح بعض الأخطاء الشائعة
  // تحويل "(صحيح)" إلى تنبيه
  if (response.match(/\(صحيح\)|\(Sahih\)|\(authentique\)/gi)) {
    // لا نغير النص لكن نضيف تحذير
    if (tier === 'premium') {
      warnings.push(language === 'ar' 
        ? '📝 ملاحظة: يُفضل ذكر أرقام الأحاديث للتوثيق الدقيق'
        : language === 'fr'
        ? '📝 Note: Il est préférable de mentionner les numéros de hadiths'
        : '📝 Note: It is better to mention hadith numbers for accurate referencing');
    }
  }

  // إضافة التحذيرات للمستخدمين Premium فقط
  if (warnings.length > 0 && tier === 'premium') {
    const divider = '\n\n---\n';
    const note = language === 'ar' 
      ? '📚 يُنصح بمراجعة المصادر الأصلية للتأكد'
      : language === 'fr'
      ? '📚 Il est conseillé de vérifier les sources originales'
      : '📚 It is advised to verify original sources';
    
    enhancedResponse += divider + warnings.join('\n') + '\n' + note;
  }

  return {
    response: enhancedResponse,
    analysis,
    warnings
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// دالة حفظ المحادثة (بدون تغيير)
// ═══════════════════════════════════════════════════════════════════════════════
async function saveConversation(userId, userMessage, assistantMessage, references) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let conversation = await prisma.conversation.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: today
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (!conversation) {
      let title = userMessage.substring(0, 60);
      if (userMessage.length > 60) {
        title += '...';
      }
      
      conversation = await prisma.conversation.create({
        data: {
          userId: userId,
          title: title
        }
      });
      
      console.log('New conversation created:', conversation.id);
    }

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: 'user',
          content: userMessage,
        },
        {
          conversationId: conversation.id,
          role: 'assistant',
          content: assistantMessage,
          references: references && references.length > 0 ? JSON.stringify(references) : null
        }
      ]
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    console.log('Messages saved to conversation:', conversation.id);
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
    console.error('❌ ANTHROPIC_API_KEY is not set!');
    return res.status(500).json({ 
      error: 'Clé API non configurée',
      debug: 'ANTHROPIC_API_KEY missing from environment'
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const rateLimitPassed = await withRateLimit(
    req, 
    res, 
    'chat', 
    10, 
    () => session.user.id
  );
  
  if (!rateLimitPassed) {
    return;
  }

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
      select: {
        subscriptionTier: true,
        messageCount: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const currentTier = user.subscriptionTier || 'free';
    const messageLimit = currentTier === 'free' ? FREE_MESSAGE_LIMIT : 
                        currentTier === 'pro' ? PRO_MESSAGE_LIMIT : 
                        Infinity;

    if (user.messageCount >= messageLimit) {
      return res.status(403).json({ 
        error: 'Limite de messages atteinte',
        limit: messageLimit,
        current: user.messageCount,
        tier: currentTier
      });
    }

    const lang = ['ar', 'fr', 'en'].includes(language) ? language : 'ar';
    const systemPrompt = systemPrompts[lang][currentTier] || systemPrompts[lang].free;
    
    let maxTokens;
    if (currentTier === 'premium') {
      maxTokens = 4000;
    } else if (currentTier === 'pro') {
      maxTokens = 2000;
    } else {
      maxTokens = 1000;
    }

    console.log(`Calling Anthropic API... (language: ${lang}, tier: ${currentTier})`);
    
    // بناء المحتوى متعدد الوسائط
    const buildMessageContent = (text, attachedImages = []) => {
      if (!attachedImages || attachedImages.length === 0) {
        return text;
      }
      
      const content = [];
      
      for (const img of attachedImages) {
        if (img.data) {
          const base64Data = img.data.includes(',') ? img.data.split(',')[1] : img.data;
          const mediaType = img.mimeType || 'image/png';
          
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data
            }
          });
        }
      }
      
      if (text) {
        content.push({
          type: 'text',
          text: text
        });
      }
      
      return content;
    };
    
    let apiMessages;
    if (conversationHistory.length > 0) {
      apiMessages = conversationHistory.map((m, index) => {
        if (index === conversationHistory.length - 1 && m.role === 'user' && images && images.length > 0) {
          return {
            role: m.role,
            content: buildMessageContent(m.content, images)
          };
        }
        return {
          role: m.role,
          content: m.content
        };
      });
    } else {
      apiMessages = [{
        role: 'user',
        content: buildMessageContent(userMessage, images)
      }];
    }
    
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: apiMessages
    });

    console.log('Anthropic API response received');

    let response = completion.content[0].text;

    // 🆕 التحقق من جودة الإجابة وتحسينها
    const validation = validateAndEnhanceResponse(response, lang, currentTier);
    response = validation.response;

    // 🆕 استخراج المراجع بالدالة المحسّنة
    const references = extractReferencesImproved(response);

    console.log('References found:', references.length);
    console.log('Quality score:', validation.analysis.score);

    const conversationId = await saveConversation(userId, userMessage, response, references);

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          messageCount: {
            increment: 1
          }
        }
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
      // 🆕 معلومات إضافية للتطوير
      quality: {
        score: validation.analysis.score,
        validRefs: validation.analysis.validRefs.length,
        warnings: validation.warnings.length
      },
      usage: {
        messagesUsed: user.messageCount + 1,
        messagesLimit: messageLimit,
        tier: currentTier
      }
    });

  } catch (error) {
    console.error('=== CHAT ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('==================');
    
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'Erreur de configuration API',
        debug: 'API key invalid or unauthorized'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' });
    }

    if (error.status === 400) {
      return res.status(400).json({ error: 'Requête invalide' });
    }
    
    return res.status(500).json({ 
      error: 'Erreur serveur',
      debug: error.message 
    });
  }
}
