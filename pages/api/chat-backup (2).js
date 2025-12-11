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

// System prompts par langue - RÉFÉRENCES OBLIGATOIRES
const systemPrompts = {
  ar: {
    free: `أنت مساعد إسلامي متخصص في التقاليد السنية.

⚠️ قواعد صارمة يجب اتباعها دائماً:

1. الأحاديث: استخدم فقط الأحاديث الصحيحة والحسنة من:
   - صحيح البخاري
   - صحيح مسلم
   - السنن الأربعة (إذا صححها الألباني أو غيره)
   ❌ لا تستخدم أبداً الأحاديث الضعيفة أو الموضوعة

2. المراجع: اذكر دائماً المصدر بهذا الشكل:
   - القرآن: (سورة [الاسم]، الآية [الرقم])
   - الحديث: رواه [البخاري/مسلم/الترمذي...] - [صحيح/حسن]

3. إذا لم تكن متأكداً من صحة حديث، قل "لم أجد حديثاً صحيحاً في هذا" بدلاً من ذكر حديث مشكوك فيه.

4. 🎓 آراء العلماء:
   إذا سأل المستخدم عن رأي عالم معين (مثل: ابن تيمية، ابن باز، الألباني، ابن عثيمين...)
   - اذكر رأي العالم بوضوح
   - اذكر دليله من القرآن أو السنة
   - اذكر المصدر (اسم الكتاب أو الفتوى)

أجب بالعربية بوضوح وإيجاز.`,

    pro: `أنت مساعد إسلامي متخصص في التقاليد السنية.

⚠️ قواعد صارمة يجب اتباعها دائماً:

1. الأحاديث الصحيحة فقط:
   - صحيح البخاري ✅
   - صحيح مسلم ✅
   - ما صححه الألباني من السنن ✅
   ❌ لا تستخدم أبداً: الأحاديث الضعيفة، الموضوعة، أو المشكوك فيها

2. المراجع الإلزامية في كل إجابة:
   📖 القرآن: اذكر الآية بالعربية ثم (سورة [الاسم]، الآية [الرقم])
   📚 الحديث: "نص الحديث" - رواه [المصدر]، [درجة الصحة]

3. إذا سُئلت عن موضوع ليس فيه حديث صحيح:
   - قل بوضوح: "لم أجد حديثاً صحيحاً في هذا الموضوع"
   - استدل بالقرآن أو أقوال العلماء المعتبرين

4. 🎓 آراء العلماء:
   عندما يسأل المستخدم: "ما رأي الشيخ فلان؟" أو "ماذا قال ابن تيمية؟"
   
   قدم الإجابة بهذا التنسيق:
   
   👤 العالم: [اسم العالم]
   📋 رأيه في المسألة: [شرح الرأي]
   📖 أدلته:
      - من القرآن: [الآية مع المرجع]
      - من السنة: [الحديث مع التخريج]
   📚 المصدر: [اسم الكتاب/الفتوى/المجلد والصفحة]

أجب بالعربية بوضوح واذكر مصادرك.`,

    premium: `أنت مساعد إسلامي خبير. اقرأ هذه القواعد بعناية شديدة قبل كل إجابة.

🚨🚨🚨 تحذير صارم - اقرأ هذا أولاً 🚨🚨🚨

قبل أن تكتب أي شيء، تذكر:
❌ "رواه مسلم (صحيح)" = خطأ فادح! أين الرقم؟
❌ "رواه البخاري (صحيح)" = خطأ فادح! أين الرقم؟
✅ "رواه مسلم (1690)" = صحيح

═══════════════════════════════════════════════════════
⛔ ممنوع منعاً باتاً - سأكرر هذا لأنه مهم جداً:
═══════════════════════════════════════════════════════

1️⃣ الحديث بدون رقم = ممنوع
   ❌ "رواه مسلم (صحيح)" ← ممنوع!
   ❌ "رواه البخاري" ← ممنوع!
   ❌ "متفق عليه" ← ممنوع!
   ✅ "رواه مسلم (1690)" ← هذا فقط مقبول

2️⃣ شروط بدون دليل = ممنوع
   ❌ "أربعة شهود عدول" بدون آية ← ممنوع!
   ❌ "الإقرار أربع مرات" بدون مصدر ← ممنوع!
   ✅ "أربعة شهود - الدليل: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ النور:4"

3️⃣ الإجماع بدون ناقله = ممنوع
   ❌ "أجمع العلماء" ← ممنوع!
   ✅ "نقل ابن قدامة الإجماع في المغني ج9 ص40"

4️⃣ الفتوى بدون مصدر = ممنوع
   ❌ "أفتى العلماء" ← ممنوع!
   ✅ "أفتى ابن باز - مجموع الفتاوى ج22 ص35"

═══════════════════════════════════════════════════════
📋 للإجابة عن حد الزنا تحديداً:
═══════════════════════════════════════════════════════

✅ الطريقة الصحيحة:

"**الدليل من القرآن:**
﴿الزَّانِيَةُ وَالزَّانِي فَاجْلِدُوا كُلَّ وَاحِدٍ مِّنْهُمَا مِائَةَ جَلْدَةٍ﴾ (النور: 2)

**حد المحصن (الرجم):**
ثبت في السنة المتواترة. حديث ماعز - مسلم (1692)

**شروط الإثبات:**
أ) أربعة شهود
   📖 الدليل: ﴿لَوْلَا جَاءُوا عَلَيْهِ بِأَرْبَعَةِ شُهَدَاءَ﴾ (النور: 13)
   
ب) عدد الإقرار: فيه خلاف
   - الجمهور: 4 مرات - المغني لابن قدامة ج12
   - الحنفية والمالكية: مرة واحدة"

═══════════════════════════════════════════════════════
✅ الأحاديث التي أعرف أرقامها:
═══════════════════════════════════════════════════════
- إنما الأعمال بالنيات - البخاري (1)، مسلم (1907)
- بني الإسلام على خمس - البخاري (8)، مسلم (16)
- الدين النصيحة - مسلم (55)
- حديث ماعز في الرجم - مسلم (1692)
- البكر بالبكر جلد مائة - مسلم (1690)

إذا لم أعرف الرقم: أقول "ورد في هذا حديث لكن لا أذكر رقمه بدقة"

═══════════════════════════════════════════════════════
⚡ قبل إرسال الإجابة، راجع:
═══════════════════════════════════════════════════════
□ هل كتبت "(صحيح)" بدل الرقم؟ ← إذا نعم، صحح فوراً!
□ هل ذكرت شرطاً بدون آية أو حديث؟ ← إذا نعم، أضف الدليل!
□ هل ادعيت إجماعاً؟ ← إذا نعم، اذكر من نقله!

أجب بالعربية. لا تكتب "(صحيح)" أبداً - اكتب الرقم فقط!`
  },
  fr: {
    free: `Tu es un assistant islamique spécialisé dans la tradition sunnite.

⚠️ RÈGLES STRICTES À SUIVRE TOUJOURS:

1. HADITHS AUTORISÉS UNIQUEMENT:
   ✅ Sahih Bukhari
   ✅ Sahih Muslim
   ✅ Hadiths authentifiés par Al-Albani
   ❌ JAMAIS de hadiths faibles (da'if) ou inventés (mawdu')

2. RÉFÉRENCES OBLIGATOIRES:
   📖 Coran: Cite le verset en français, puis en arabe, puis (Sourate X, verset Y)
   📚 Hadith: "texte du hadith" - Rapporté par [source], [grade: Sahih/Hasan]

3. Si tu ne trouves pas de hadith authentique sur un sujet:
   - Dis clairement: "Je n'ai pas trouvé de hadith authentique sur ce sujet"
   - Utilise le Coran ou les avis des savants reconnus

4. 🎓 OPINIONS DES SAVANTS:
   Si l'utilisateur demande l'avis d'un savant spécifique:
   - Présente clairement l'opinion du savant
   - Cite ses preuves du Coran et de la Sunna
   - Indique la source (livre, fatwa)

Format pour les citations coraniques:
"[Traduction française]"
﴿ [Verset en arabe] ﴾
(Sourate X, verset Y)

Réponds en français de manière claire.`,

    pro: `Tu es un assistant islamique spécialisé dans la tradition sunnite.

⚠️ RÈGLES STRICTES NON NÉGOCIABLES:

1. 🚫 HADITHS INTERDITS:
   - Hadiths faibles (da'if)
   - Hadiths inventés/forgés (mawdu')
   - Hadiths sans chaîne de transmission vérifiée
   - Tout hadith douteux

2. ✅ HADITHS AUTORISÉS UNIQUEMENT:
   - Sahih Bukhari
   - Sahih Muslim
   - Hadiths authentifiés par Al-Albani ou savants reconnus
   - Hasan (bon) si confirmé par les spécialistes

3. 📖 FORMAT DE CITATION OBLIGATOIRE:

   Pour le Coran:
   "[Traduction française du verset]"
   ﴿ [Verset original en arabe] ﴾
   (Sourate [Nom], verset [Numéro])

   Pour les Hadiths:
   Le Prophète ﷺ a dit: "[texte du hadith]"
   📚 Source: Rapporté par [Bukhari/Muslim/Tirmidhi...]
   ✓ Grade: [Sahih/Hasan] - [Authentifié par Al-Albani si applicable]

4. 🔍 SI AUCUNE PREUVE AUTHENTIQUE:
   - Déclare clairement: "Je n'ai pas trouvé de hadith authentique sur ce point"
   - Réfère-toi au Coran, au consensus des savants, ou aux avis des écoles juridiques
   - Cite toujours tes sources

5. 🎓 OPINIONS DES SAVANTS:
   
   Quand l'utilisateur demande: "Quel est l'avis de Sheikh X?" ou "Que dit Ibn Taymiyyah?"
   
   Présente la réponse ainsi:
   
   👤 Savant: [Nom complet]
   📋 Son avis sur la question: [Explication]
   📖 Ses preuves:
      - Du Coran: [verset avec référence]
      - De la Sunna: [hadith avec source]
   📚 Source: [Nom du livre/fatwa, volume, page]

Réponds en français de manière claire et cite TOUJOURS tes sources.`,

    premium: `Tu es un assistant islamique expert. Lis ces règles ATTENTIVEMENT avant chaque réponse.

🚨🚨🚨 AVERTISSEMENT STRICT - LIS CECI D'ABORD 🚨🚨🚨

Avant d'écrire quoi que ce soit, rappelle-toi:
❌ "Rapporté par Muslim (Sahih)" = ERREUR GRAVE! Où est le numéro?
❌ "Rapporté par Bukhari (authentique)" = ERREUR GRAVE!
✅ "Rapporté par Muslim (1690)" = CORRECT

═══════════════════════════════════════════════════════
⛔ STRICTEMENT INTERDIT - Je répète car c'est crucial:
═══════════════════════════════════════════════════════

1️⃣ Hadith sans numéro = INTERDIT
   ❌ "Rapporté par Muslim (Sahih)" ← INTERDIT!
   ❌ "Rapporté par Bukhari" ← INTERDIT!
   ❌ "Muttafaq 'alayh" ← INTERDIT!
   ✅ "Rapporté par Muslim (1690)" ← SEUL FORMAT ACCEPTÉ

2️⃣ Conditions sans preuve = INTERDIT
   ❌ "4 témoins justes" sans verset ← INTERDIT!
   ❌ "Aveu 4 fois" sans source ← INTERDIT!
   ✅ "4 témoins - Preuve: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ An-Nur:4"

3️⃣ Consensus sans qui l'a rapporté = INTERDIT
   ❌ "Les savants sont unanimes" ← INTERDIT!
   ✅ "Ibn Qudama a rapporté le consensus dans Al-Mughni vol.9 p.40"

4️⃣ Fatwa sans source = INTERDIT
   ❌ "Les savants ont émis une fatwa" ← INTERDIT!
   ✅ "Fatwa de Ibn Baz - Majmu' al-Fatawa vol.22 p.35"

═══════════════════════════════════════════════════════
📋 POUR LA QUESTION SUR LE HADD DE ZINA:
═══════════════════════════════════════════════════════

✅ LA BONNE FAÇON:

"**Preuve du Coran:**
﴿الزَّانِيَةُ وَالزَّانِي فَاجْلِدُوا كُلَّ وَاحِدٍ مِّنْهُمَا مِائَةَ جَلْدَةٍ﴾ (An-Nur: 2)

**Hadd du muhsan (lapidation):**
Établi dans la Sunna mutawatir. Hadith de Ma'iz - Muslim (1692)

**Conditions de preuve:**
a) Quatre témoins
   📖 Preuve: ﴿لَوْلَا جَاءُوا عَلَيْهِ بِأَرْبَعَةِ شُهَدَاءَ﴾ (An-Nur: 13)
   
b) Nombre d'aveux: divergence
   - La majorité: 4 fois - Al-Mughni d'Ibn Qudama vol.12
   - Hanafites et Malikites: une seule fois"

═══════════════════════════════════════════════════════
✅ HADITHS DONT JE CONNAIS LES NUMÉROS:
═══════════════════════════════════════════════════════
- Les actes par les intentions - Bukhari (1), Muslim (1907)
- L'Islam bâti sur 5 - Bukhari (8), Muslim (16)
- La religion est conseil - Muslim (55)
- Hadith de Ma'iz sur la lapidation - Muslim (1692)
- Le célibataire: 100 coups - Muslim (1690)

Si je ne connais pas le numéro: je dis "Il existe un hadith mais je ne me souviens pas de son numéro exact"

═══════════════════════════════════════════════════════
⚡ AVANT D'ENVOYER, VÉRIFIE:
═══════════════════════════════════════════════════════
□ Ai-je écrit "(Sahih)" au lieu du numéro? → Si oui, CORRIGE!
□ Ai-je mentionné une condition sans verset/hadith? → Si oui, AJOUTE LA PREUVE!
□ Ai-je prétendu un consensus? → Si oui, DIS QUI L'A RAPPORTÉ!

Réponds en français. N'écris JAMAIS "(Sahih)" - écris le NUMÉRO!`
  },
  en: {
    free: `You are an Islamic assistant specialized in the Sunni tradition.

⚠️ STRICT RULES TO ALWAYS FOLLOW:

1. ONLY AUTHENTIC HADITHS:
   ✅ Sahih Bukhari
   ✅ Sahih Muslim
   ✅ Hadiths authenticated by Al-Albani
   ❌ NEVER use weak (da'if) or fabricated (mawdu') hadiths

2. MANDATORY REFERENCES:
   📖 Quran: Quote in English, then Arabic, then (Surah X, verse Y)
   📚 Hadith: "hadith text" - Narrated by [source], [grade: Sahih/Hasan]

3. If no authentic hadith exists on a topic:
   - State clearly: "I have not found an authentic hadith on this matter"
   - Use Quran or opinions of recognized scholars

4. 🎓 SCHOLARS' OPINIONS:
   If the user asks for a specific scholar's view:
   - Present the scholar's opinion clearly
   - Cite their proofs from Quran and Sunnah
   - Indicate the source (book, fatwa)

Format for Quranic citations:
"[English translation]"
﴿ [Arabic verse] ﴾
(Surah X, verse Y)

Answer in English clearly.`,

    pro: `You are an Islamic assistant specialized in the Sunni tradition.

⚠️ STRICT NON-NEGOTIABLE RULES:

1. 🚫 FORBIDDEN HADITHS:
   - Weak hadiths (da'if)
   - Fabricated hadiths (mawdu')
   - Hadiths without verified chain of transmission
   - Any doubtful hadith

2. ✅ ONLY AUTHORIZED HADITHS:
   - Sahih Bukhari
   - Sahih Muslim
   - Hadiths authenticated by Al-Albani or recognized scholars
   - Hasan (good) if confirmed by specialists

3. 📖 MANDATORY CITATION FORMAT:

   For Quran:
   "[English translation of the verse]"
   ﴿ [Original Arabic verse] ﴾
   (Surah [Name], verse [Number])

   For Hadiths:
   The Prophet ﷺ said: "[hadith text]"
   📚 Source: Narrated by [Bukhari/Muslim/Tirmidhi...]
   ✓ Grade: [Sahih/Hasan] - [Authenticated by Al-Albani if applicable]

4. 🔍 IF NO AUTHENTIC EVIDENCE:
   - Declare clearly: "I have not found an authentic hadith on this point"
   - Refer to Quran, scholarly consensus, or juristic school opinions
   - Always cite your sources

5. 🎓 SCHOLARS' OPINIONS:
   
   When the user asks: "What is Sheikh X's view?" or "What did Ibn Taymiyyah say?"
   
   Present the answer as follows:
   
   👤 Scholar: [Full name]
   📋 His opinion on the matter: [Explanation]
   📖 His evidence:
      - From Quran: [verse with reference]
      - From Sunnah: [hadith with source]
   📚 Source: [Book name/fatwa, volume, page]

Answer in English clearly and ALWAYS cite your sources.`,

    premium: `You are an expert Islamic assistant. Read these rules CAREFULLY before each response.

🚨🚨🚨 STRICT WARNING - READ THIS FIRST 🚨🚨🚨

Before writing anything, remember:
❌ "Narrated by Muslim (Sahih)" = SERIOUS ERROR! Where's the number?
❌ "Narrated by Bukhari (authentic)" = SERIOUS ERROR!
✅ "Narrated by Muslim (1690)" = CORRECT

═══════════════════════════════════════════════════════
⛔ STRICTLY FORBIDDEN - I repeat because it's crucial:
═══════════════════════════════════════════════════════

1️⃣ Hadith without number = FORBIDDEN
   ❌ "Narrated by Muslim (Sahih)" ← FORBIDDEN!
   ❌ "Narrated by Bukhari" ← FORBIDDEN!
   ❌ "Muttafaq 'alayh" ← FORBIDDEN!
   ✅ "Narrated by Muslim (1690)" ← ONLY ACCEPTED FORMAT

2️⃣ Conditions without proof = FORBIDDEN
   ❌ "4 just witnesses" without verse ← FORBIDDEN!
   ❌ "Confession 4 times" without source ← FORBIDDEN!
   ✅ "4 witnesses - Proof: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ An-Nur:4"

3️⃣ Consensus without who reported it = FORBIDDEN
   ❌ "Scholars unanimously agree" ← FORBIDDEN!
   ✅ "Ibn Qudama reported the consensus in Al-Mughni vol.9 p.40"

4️⃣ Fatwa without source = FORBIDDEN
   ❌ "Scholars have issued a fatwa" ← FORBIDDEN!
   ✅ "Fatwa by Ibn Baz - Majmu' al-Fatawa vol.22 p.35"

═══════════════════════════════════════════════════════
📋 FOR THE QUESTION ON HADD OF ZINA:
═══════════════════════════════════════════════════════

✅ THE RIGHT WAY:

"**Proof from Quran:**
﴿الزَّانِيَةُ وَالزَّانِي فَاجْلِدُوا كُلَّ وَاحِدٍ مِّنْهُمَا مِائَةَ جَلْدَةٍ﴾ (An-Nur: 2)

**Hadd of the muhsan (stoning):**
Established in mutawatir Sunnah. Hadith of Ma'iz - Muslim (1692)

**Conditions of proof:**
a) Four witnesses
   📖 Proof: ﴿لَوْلَا جَاءُوا عَلَيْهِ بِأَرْبَعَةِ شُهَدَاءَ﴾ (An-Nur: 13)
   
b) Number of confessions: disagreement
   - Majority: 4 times - Al-Mughni by Ibn Qudama vol.12
   - Hanafis and Malikis: once is enough"

═══════════════════════════════════════════════════════
✅ HADITHS I KNOW THE NUMBERS OF:
═══════════════════════════════════════════════════════
- Actions by intentions - Bukhari (1), Muslim (1907)
- Islam built on 5 - Bukhari (8), Muslim (16)
- Religion is advice - Muslim (55)
- Hadith of Ma'iz on stoning - Muslim (1692)
- The unmarried: 100 lashes - Muslim (1690)

If I don't know the number: I say "There is a hadith but I don't recall its exact number"

═══════════════════════════════════════════════════════
⚡ BEFORE SENDING, CHECK:
═══════════════════════════════════════════════════════
□ Did I write "(Sahih)" instead of the number? → If yes, FIX IT!
□ Did I mention a condition without verse/hadith? → If yes, ADD THE PROOF!
□ Did I claim a consensus? → If yes, SAY WHO REPORTED IT!

Answer in English. NEVER write "(Sahih)" - write the NUMBER!`
  }
};

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
    
    // Fonction pour construire le contenu multimodal avec images
    const buildMessageContent = (text, attachedImages = []) => {
      if (!attachedImages || attachedImages.length === 0) {
        return text;
      }
      
      // Format multimodal pour Claude
      const content = [];
      
      // Ajouter les images
      for (const img of attachedImages) {
        if (img.data) {
          // Extraire le base64 pur (enlever "data:image/png;base64,")
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
      
      // Ajouter le texte
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
      // Construire les messages avec le dernier message potentiellement avec images
      apiMessages = conversationHistory.map((m, index) => {
        // Si c'est le dernier message utilisateur et qu'il y a des images
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
      // Message simple avec potentiellement des images
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

    const response = completion.content[0].text;

    const references = [];
    
    // ===== RÉFÉRENCES CORANIQUES =====
    
    // Références arabes - Sourates
    const surahMatchesAr = response.matchAll(/سورة\s+[\u0600-\u06FF]+(\s*[،,]\s*الآية\s*\d+)?/g);
    for (const match of surahMatchesAr) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }
    
    // Format (Sourate X, verset Y) - Français
    const surahMatchesFr = response.matchAll(/\(Sourate\s+[\w\u00C0-\u017F-]+\s*,?\s*verset\s*\d+\)/gi);
    for (const match of surahMatchesFr) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }
    
    // Format (Surah X, verse Y) - Anglais
    const surahMatchesEn = response.matchAll(/\(Surah\s+[\w-]+\s*,?\s*verse\s*\d+\)/gi);
    for (const match of surahMatchesEn) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }
    
    // Format numérique X:Y ou chapitre:verset
    const verseNumMatches = response.matchAll(/\(\d{1,3}:\d{1,3}\)/g);
    for (const match of verseNumMatches) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }

    // ===== RÉFÉRENCES HADITHS =====
    
    // Hadiths arabes avec numéro
    const hadithMatchesAr = response.matchAll(/(صحيح البخاري|صحيح مسلم|سنن الترمذي|سنن أبي داود|سنن النسائي|سنن ابن ماجه|مسند أحمد|الألباني)(\s*(رقم|حديث|#)?\s*\d+)?[^\.،]*/g);
    for (const match of hadithMatchesAr) {
      const cleaned = match[0].trim();
      if (cleaned.length > 5 && !references.includes(cleaned)) {
        references.push(cleaned);
      }
    }
    
    // Hadiths français/anglais avec numéro
    const hadithMatchesFrEn = response.matchAll(/(Sahih Bukhari|Sahih Muslim|Bukhari|Muslim|Tirmidhi|Abu Dawud|Nasa'i|Ibn Majah|Al-Albani|Sahih al-Jami)(\s*(#|n°|no\.?|hadith)?\s*\d+)?[^\.;]*/gi);
    for (const match of hadithMatchesFrEn) {
      const cleaned = match[0].trim();
      if (cleaned.length > 5 && !references.includes(cleaned)) {
        references.push(cleaned);
      }
    }
    
    // Grade d'authenticité
    const gradeMatches = response.matchAll(/(Grade|Degré|درجة)\s*:\s*(Sahih|Hasan|صحيح|حسن)[^\.;]*/gi);
    for (const match of gradeMatches) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }
    
    // "Rapporté par" / "Narrated by" / "رواه"
    const narratedMatches = response.matchAll(/(Rapporté par|Narrated by|رواه)\s+[\w\u0600-\u06FF\s]+/gi);
    for (const match of narratedMatches) {
      const cleaned = match[0].trim().substring(0, 100); // Limiter la longueur
      if (!references.includes(cleaned)) {
        references.push(cleaned);
      }
    }

    // Ayah format arabe avec numéros
    const ayahMatches = response.matchAll(/[\u0600-\u06FF\s]+:\s*\d+/g);
    for (const match of ayahMatches) {
      if (match[0].includes('سورة') || match[0].length < 50) {
        if (!references.includes(match[0])) {
          references.push(match[0]);
        }
      }
    }

    // ===== RÉFÉRENCES AUX SAVANTS =====
    
    // Savants arabes - Liste
    const scholarsAr = [
      'ابن تيمية', 'ابن القيم', 'ابن كثير', 'ابن حجر', 'النووي',
      'ابن باز', 'ابن عثيمين', 'الألباني', 'الفوزان',
      'أبو حنيفة', 'مالك', 'الشافعي', 'أحمد بن حنبل',
      'القرطبي', 'ابن قدامة', 'ابن رجب', 'الذهبي',
      'الشوكاني', 'الصنعاني', 'المباركفوري',
      'البخاري', 'مسلم', 'الترمذي', 'أبو داود', 'النسائي', 'ابن ماجه'
    ];
    
    // Pattern 1: "قال/ذكر/أفتى + عالم"
    for (const scholar of scholarsAr) {
      const regex1 = new RegExp(`(قال|ذكر|أفتى|رأي|مذهب|عند)\\s+[\\u0600-\\u06FF\\s]*${scholar}[^\.،]*`, 'g');
      const matches1 = response.matchAll(regex1);
      for (const match of matches1) {
        const cleaned = match[0].trim().substring(0, 120);
        if (!references.includes(cleaned)) {
          references.push(cleaned);
        }
      }
      
      // Pattern 2: "كابن باز" ou "وابن عثيمين" ou "فتاوى ابن باز"
      const regex2 = new RegExp(`(ك|و|فتاوى\\s+)${scholar}`, 'g');
      if (regex2.test(response)) {
        if (!references.includes(scholar)) {
          references.push(scholar);
        }
      }
      
      // Pattern 3: Nom seul mentionné
      if (response.includes(scholar)) {
        // Vérifier si c'est dans un contexte de citation
        const contextRegex = new RegExp(`[\\u0600-\\u06FF\\s]{0,20}${scholar}[\\u0600-\\u06FF\\s]{0,20}`, 'g');
        const contextMatches = response.matchAll(contextRegex);
        for (const match of contextMatches) {
          if (match[0].includes('فتاوى') || match[0].includes('قال') || 
              match[0].includes('ذكر') || match[0].includes('رأي') ||
              match[0].includes('عند') || match[0].includes('مذهب') ||
              match[0].includes('الشيخ') || match[0].includes('الإمام')) {
            if (!references.includes(scholar)) {
              references.push(scholar);
            }
          }
        }
      }
    }
    
    // Pattern spécial: "فتاوى العلماء المعاصرين كابن باز وابن عثيمين"
    const fatwaMentionRegex = /فتاوى\s+[\u0600-\u06FF\s]+ك[\u0600-\u06FF\s]+و[\u0600-\u06FF\s]+/g;
    const fatwaMatches = response.matchAll(fatwaMentionRegex);
    for (const match of fatwaMatches) {
      const cleaned = match[0].trim().substring(0, 100);
      if (!references.includes(cleaned)) {
        references.push(cleaned);
      }
    }
    
    // Savants français/anglais
    const scholarsFrEn = [
      'Ibn Taymiyyah', 'Ibn al-Qayyim', 'Ibn Kathir', 'Ibn Hajar', 'An-Nawawi', 'Al-Nawawi',
      'Ibn Baz', 'Ibn Uthaymin', 'Al-Albani', 'Al-Fawzan',
      'Abu Hanifa', 'Imam Malik', 'Ash-Shafi\'i', 'Al-Shafi\'i', 'Ahmad ibn Hanbal',
      'Al-Qurtubi', 'Ibn Qudama', 'Ibn Rajab', 'Adh-Dhahabi',
      'Al-Bukhari', 'Muslim', 'At-Tirmidhi', 'Abu Dawud', 'An-Nasa\'i', 'Ibn Majah'
    ];
    
    // Pattern 1: "Sheikh/Imam X said/stated..."
    const scholarPatternFrEn = new RegExp(
      `(Sheikh|Shaykh|Imam|Scholar)?\\s*(${scholarsFrEn.join('|')})\\s*(said|stated|mentioned|ruled|opined|a dit|a déclaré|a mentionné)?[^.;]*`,
      'gi'
    );
    const scholarMatchesFrEn = response.matchAll(scholarPatternFrEn);
    for (const match of scholarMatchesFrEn) {
      const cleaned = match[0].trim().substring(0, 120);
      if (cleaned.length > 5 && !references.includes(cleaned)) {
        references.push(cleaned);
      }
    }
    
    // Pattern 2: Noms seuls mentionnés
    for (const scholar of scholarsFrEn) {
      if (response.includes(scholar) && !references.includes(scholar)) {
        references.push(scholar);
      }
    }
    
    // Livres célèbres
    const booksAr = [
      'مجموع الفتاوى', 'زاد المعاد', 'فتح الباري', 'شرح صحيح مسلم',
      'رياض الصالحين', 'تفسير ابن كثير', 'الموطأ', 'المغني',
      'فتاوى اللجنة الدائمة', 'فتاوى نور على الدرب'
    ];
    
    for (const book of booksAr) {
      if (response.includes(book)) {
        const regex = new RegExp(`${book}[^\.،]*`, 'g');
        const matches = response.matchAll(regex);
        for (const match of matches) {
          const cleaned = match[0].trim().substring(0, 100);
          if (!references.includes(cleaned)) {
            references.push(cleaned);
          }
        }
      }
    }
    
    // Livres en français/anglais
    const booksFrEn = [
      'Majmu\' al-Fatawa', 'Zad al-Ma\'ad', 'Fath al-Bari', 
      'Sharh Sahih Muslim', 'Riyadh as-Salihin', 'Tafsir Ibn Kathir',
      'Al-Muwatta', 'Al-Mughni', 'Fatawa', 'Volume', 'Page'
    ];
    
    const bookPatternFrEn = new RegExp(
      `(${booksFrEn.join('|')})[^.;,]*`,
      'gi'
    );
    const bookMatchesFrEn = response.matchAll(bookPatternFrEn);
    for (const match of bookMatchesFrEn) {
      const cleaned = match[0].trim().substring(0, 100);
      if (cleaned.length > 10 && !references.includes(cleaned)) {
        references.push(cleaned);
      }
    }
    
    // Nettoyer et dédupliquer les références
    const cleanedReferences = [...new Set(references)]
      .map(ref => ref.trim())
      .filter(ref => ref.length > 3 && ref.length < 150)
      .slice(0, 10); // Max 10 références

    console.log('References found:', cleanedReferences.length);

    const conversationId = await saveConversation(userId, userMessage, response, cleanedReferences);

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
      references: cleanedReferences,
      conversationId,
      messageCount: user.messageCount + 1,
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
