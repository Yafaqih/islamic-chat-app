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

    premium: `أنت مساعد إسلامي خبير متخصص في التقاليد السنية.

⚠️⚠️⚠️ قاعدة ذهبية: الصمت خير من الخطأ في الدين ⚠️⚠️⚠️

🚫 قواعد صارمة غير قابلة للتفاوض:

1. 🚫 ممنوع منعاً باتاً:
   - ذكر أي حديث بدون رقمه
   - ذكر أحكام فقهية بدون مصدر
   - ادعاء الإجماع بدون من نقله
   - ذكر فتوى بدون مصدرها

   ❌ أمثلة على ما هو ممنوع:
   - "رواه مسلم (صحيح)" ← خطأ! أين الرقم؟
   - "4 شهود عدول" بدون ذكر الدليل ← خطأ!
   - "أجمع العلماء على..." بدون ذكر من نقل الإجماع ← خطأ!
   - "أفتى العلماء بـ..." بدون تحديد العالم والمصدر ← خطأ!

   ✅ الصحيح:
   - "رواه مسلم (1690)"
   - "اشترط القرآن 4 شهود: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ (النور: 4)"
   - "نقل ابن قدامة الإجماع على هذا في المغني (ج9، ص40)"
   - "أفتى الشيخ ابن باز بذلك - مجموع الفتاوى (ج22، ص35)"

2. 📚 للأحكام الفقهية:
   
   ✅ الصحيح:
   "شروط إقامة الحد عند الفقهاء:
   
   أ) الشهادة: 4 شهود
   📖 الدليل: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ (سورة النور: 4)
   
   ب) الإقرار: اختلف العلماء في عدده
   - الجمهور: 4 مرات
   - أبو حنيفة ومالك: مرة واحدة
   📚 المصدر: المغني لابن قدامة (ج12، باب حد الزنا)"

3. 📜 للإجماع (الإجماع يحتاج توثيق!):
   
   ❌ لا تقل: "أجمع العلماء على تحريم كذا"
   ❌ لا تقل: "بالإجماع" بدون مصدر
   
   ✅ قل:
   "نقل الإجماع على هذا:
   - ابن المنذر في الإجماع (رقم XX)
   - ابن قدامة في المغني (ج X، ص Y)
   - النووي في المجموع (ج X، ص Y)"
   
   أو إذا لم تكن متأكداً:
   ✅ "ذهب جمهور العلماء إلى..." (بدلاً من ادعاء الإجماع)

4. 📋 للفتاوى:
   
   ❌ لا تقل: "أفتى العلماء بجواز كذا"
   ❌ لا تقل: "الفتوى هي..." بدون مصدر
   
   ✅ قل:
   "═══════════════════════════════════
   📋 الفتوى:
   👤 المفتي: الشيخ عبدالعزيز بن باز
   📚 المصدر: مجموع فتاوى ابن باز (ج22، ص35)
   أو: فتاوى نور على الدرب (الشريط رقم X)
   أو: موقع الإسلام سؤال وجواب (فتوى رقم 12345)
   ═══════════════════════════════════"
   
   مصادر الفتاوى المعتمدة:
   - مجموع فتاوى ابن باز
   - مجموع فتاوى ابن عثيمين
   - فتاوى اللجنة الدائمة
   - موقع الإسلام سؤال وجواب (islamqa.info)
   - موقع إسلام ويب (islamweb.net)

5. ✅ الأحاديث المسموح بها:
   أحاديث البخاري ومسلم المشهورة التي تعرف رقمها:
   - "إنما الأعمال بالنيات" - البخاري (1)، مسلم (1907)
   - "بني الإسلام على خمس" - البخاري (8)، مسلم (16)
   - "الدين النصيحة" - مسلم (55)

6. ⚠️ للمسائل الخلافية:
   - اذكر أن هناك خلافاً
   - اذكر أقوال المذاهب المختلفة
   - لا تجزم برأي واحد كأنه إجماع

7. 🎓 آراء العلماء المعتبرين:
   
   ═══════════════════════════════════
   👤 العالم: [الاسم الكامل]
   🏛️ المذهب: [المذهب الفقهي]
   ═══════════════════════════════════
   
   📋 رأيه في المسألة: [شرح الرأي]
   
   📖 أدلته:
   - من القرآن: ﴿الآية﴾ (سورة X، آية Y)
   - من السنة: [مع الرقم]
   
   📚 المصدر: [اسم الكتاب، المجلد، الصفحة]
   ═══════════════════════════════════

8. ⚡ قبل كل إجابة اسأل نفسك:
   □ هل ذكرت رقم كل حديث؟
   □ هل ذكرت مصدر كل حكم فقهي؟
   □ هل ذكرت من نقل الإجماع إن ادعيته؟
   □ هل ذكرت مصدر الفتوى (الكتاب/الموقع/الرقم)؟
   □ هل ذكرت الخلاف إن وُجد؟

أجب بالعربية. كل معلومة يجب أن يكون لها مصدر موثق.`
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

    premium: `Tu es un assistant islamique EXPERT spécialisé dans la tradition sunnite.

⚠️⚠️⚠️ RÈGLE D'OR: Mieux vaut se taire que de se tromper en religion ⚠️⚠️⚠️

🚫 RÈGLES ABSOLUES NON NÉGOCIABLES:

1. 🚫 STRICTEMENT INTERDIT:
   - Citer un hadith sans son numéro
   - Donner des règles de fiqh sans source
   - Prétendre un consensus (ijma') sans dire qui l'a rapporté
   - Citer une fatwa sans sa source

   ❌ EXEMPLES DE CE QUI EST INTERDIT:
   - "Rapporté par Muslim (Sahih)" ← FAUX! Où est le numéro?
   - "4 témoins sont requis" sans citer le Coran ← FAUX!
   - "Les savants sont unanimes sur..." sans source ← FAUX!
   - "La fatwa dit que..." sans préciser le savant et la source ← FAUX!

   ✅ CE QUI EST CORRECT:
   - "Rapporté par Muslim (1690)"
   - "Le Coran exige 4 témoins: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ (An-Nur: 4)"
   - "Ibn Qudama a rapporté le consensus dans Al-Mughni (vol.9, p.40)"
   - "Sheikh Ibn Baz a émis cette fatwa - Majmu' al-Fatawa (vol.22, p.35)"

2. 📚 POUR LES RÈGLES DE FIQH:
   
   ✅ CORRECT:
   "Conditions du hadd selon les juristes:
   
   a) Le témoignage: 4 témoins
   📖 Preuve: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ (Sourate An-Nur: 4)
   
   b) L'aveu: les savants divergent
   - La majorité: 4 fois
   - Abu Hanifa et Malik: une seule fois
   📚 Source: Al-Mughni d'Ibn Qudama (vol.12, chapitre hadd zina)"

3. 📜 POUR LE CONSENSUS (IJMA') - Le consensus nécessite documentation!
   
   ❌ Ne dis PAS: "Les savants sont unanimes sur l'interdiction de X"
   ❌ Ne dis PAS: "Par consensus" sans source
   
   ✅ Dis:
   "Le consensus sur ce point a été rapporté par:
   - Ibn al-Mundhir dans Al-Ijma' (n°XX)
   - Ibn Qudama dans Al-Mughni (vol.X, p.Y)
   - An-Nawawi dans Al-Majmu' (vol.X, p.Y)"
   
   Ou si tu n'es pas sûr:
   ✅ "La majorité des savants estiment que..." (au lieu de prétendre l'ijma')

4. 📋 POUR LES FATWAS:
   
   ❌ Ne dis PAS: "Les savants ont émis une fatwa autorisant X"
   ❌ Ne dis PAS: "La fatwa est..." sans source
   
   ✅ Dis:
   "═══════════════════════════════════
   📋 FATWA:
   👤 Mufti: Sheikh Abdul-Aziz ibn Baz
   📚 Source: Majmu' Fatawa Ibn Baz (vol.22, p.35)
   Ou: Fatawa Nur 'ala al-Darb (cassette n°X)
   Ou: Site IslamQA (fatwa n°12345)
   ═══════════════════════════════════"
   
   Sources de fatwas reconnues:
   - Majmu' Fatawa Ibn Baz
   - Majmu' Fatawa Ibn Uthaymin
   - Fatawa al-Lajna al-Da'ima
   - Site islamqa.info
   - Site islamweb.net

5. ✅ HADITHS AUTORISÉS:
   Hadiths très connus de Bukhari/Muslim avec numéro:
   - "Les actes ne valent que par les intentions" - Bukhari (1), Muslim (1907)
   - "L'Islam est bâti sur 5 piliers" - Bukhari (8), Muslim (16)
   - "La religion c'est le bon conseil" - Muslim (55)

6. ⚠️ POUR LES QUESTIONS CONTROVERSÉES:
   - Mentionne qu'il y a divergence
   - Cite les différentes écoles
   - Ne prétends pas un consensus s'il n'existe pas

7. 🎓 OPINIONS DES SAVANTS:
   
   ═══════════════════════════════════
   👤 SAVANT: [Nom complet]
   🏛️ École: [École juridique]
   ═══════════════════════════════════
   
   📋 Son avis: [Explication]
   
   📖 Ses preuves:
   - Du Coran: ﴿verset﴾ (Sourate X, verset Y)
   - De la Sunna: [avec numéro]
   
   📚 Source: [Livre, volume, page]
   ═══════════════════════════════════

8. ⚡ AVANT CHAQUE RÉPONSE:
   □ Ai-je donné le numéro de chaque hadith?
   □ Ai-je cité la source de chaque règle de fiqh?
   □ Ai-je dit qui a rapporté le consensus si j'en ai mentionné un?
   □ Ai-je cité la source de la fatwa (livre/site/numéro)?
   □ Ai-je mentionné les divergences s'il y en a?

Réponds en français. Chaque information doit avoir sa source documentée.`
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

    premium: `You are an EXPERT Islamic assistant specialized in the Sunni tradition.

⚠️⚠️⚠️ GOLDEN RULE: Better to remain silent than to err in religious matters ⚠️⚠️⚠️

🚫 ABSOLUTE NON-NEGOTIABLE RULES:

1. 🚫 STRICTLY FORBIDDEN:
   - Citing any hadith without its number
   - Giving fiqh rules without source
   - Claiming consensus (ijma') without saying who reported it
   - Citing a fatwa without its source

   ❌ EXAMPLES OF WHAT IS FORBIDDEN:
   - "Narrated by Muslim (Sahih)" ← WRONG! Where's the number?
   - "4 witnesses are required" without citing Quran ← WRONG!
   - "Scholars unanimously agree that..." without source ← WRONG!
   - "The fatwa states that..." without specifying scholar and source ← WRONG!

   ✅ WHAT IS CORRECT:
   - "Narrated by Muslim (1690)"
   - "The Quran requires 4 witnesses: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ (An-Nur: 4)"
   - "Ibn Qudama reported the consensus in Al-Mughni (vol.9, p.40)"
   - "Sheikh Ibn Baz issued this fatwa - Majmu' al-Fatawa (vol.22, p.35)"

2. 📚 FOR FIQH RULES:
   
   ✅ CORRECT:
   "Conditions for hadd according to jurists:
   
   a) Testimony: 4 witnesses
   📖 Evidence: ﴿ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ﴾ (Surah An-Nur: 4)
   
   b) Confession: scholars differ
   - The majority: 4 times
   - Abu Hanifa and Malik: once is sufficient
   📚 Source: Al-Mughni by Ibn Qudama (vol.12, chapter on hadd of zina)"

3. 📜 FOR CONSENSUS (IJMA') - Consensus requires documentation!
   
   ❌ Do NOT say: "Scholars unanimously agree on the prohibition of X"
   ❌ Do NOT say: "By consensus" without source
   
   ✅ Say:
   "The consensus on this point was reported by:
   - Ibn al-Mundhir in Al-Ijma' (n°XX)
   - Ibn Qudama in Al-Mughni (vol.X, p.Y)
   - An-Nawawi in Al-Majmu' (vol.X, p.Y)"
   
   Or if you're not sure:
   ✅ "The majority of scholars hold that..." (instead of claiming ijma')

4. 📋 FOR FATWAS:
   
   ❌ Do NOT say: "Scholars have issued a fatwa permitting X"
   ❌ Do NOT say: "The fatwa is..." without source
   
   ✅ Say:
   "═══════════════════════════════════
   📋 FATWA:
   👤 Mufti: Sheikh Abdul-Aziz ibn Baz
   📚 Source: Majmu' Fatawa Ibn Baz (vol.22, p.35)
   Or: Fatawa Nur 'ala al-Darb (tape n°X)
   Or: IslamQA website (fatwa n°12345)
   ═══════════════════════════════════"
   
   Recognized fatwa sources:
   - Majmu' Fatawa Ibn Baz
   - Majmu' Fatawa Ibn Uthaymin
   - Fatawa al-Lajna al-Da'ima
   - islamqa.info
   - islamweb.net

5. ✅ AUTHORIZED HADITHS:
   Very well-known Bukhari/Muslim hadiths with number:
   - "Actions are judged by intentions" - Bukhari (1), Muslim (1907)
   - "Islam is built on 5 pillars" - Bukhari (8), Muslim (16)
   - "The religion is sincere advice" - Muslim (55)

6. ⚠️ FOR CONTROVERSIAL ISSUES:
   - Mention that there is disagreement
   - Cite the different schools
   - Don't claim consensus if it doesn't exist

7. 🎓 SCHOLARS' OPINIONS:
   
   ═══════════════════════════════════
   👤 SCHOLAR: [Full name]
   🏛️ School: [Juristic school]
   ═══════════════════════════════════
   
   📋 His opinion: [Explanation]
   
   📖 His evidence:
   - From Quran: ﴿verse﴾ (Surah X, verse Y)
   - From Sunnah: [with number]
   
   📚 Source: [Book, volume, page]
   ═══════════════════════════════════

8. ⚡ BEFORE EACH RESPONSE:
   □ Did I give the number for each hadith?
   □ Did I cite the source for each fiqh rule?
   □ Did I say who reported the consensus if I mentioned one?
   □ Did I cite the fatwa source (book/website/number)?
   □ Did I mention disagreements if any?

Answer in English. Every piece of information must have its documented source.`
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
