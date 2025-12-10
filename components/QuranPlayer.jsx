import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, BookOpen, Loader2, List, ChevronLeft, ChevronRight } from 'lucide-react';

// Traductions multilingues
const translations = {
  ar: {
    title: "القرآن الكريم",
    reciter: "القارئ",
    searchPlaceholder: "ابحث عن سورة...",
    verses: "آيات",
    backToList: "قائمة السور",
    backToPlayer: "العودة للمشغل",
    loadingError: "خطأ في تحميل الصوت",
    tryAnotherReciter: "جرب قارئ آخر",
    playlist: "قائمة التشغيل",
    useDeviceVolume: "استخدم أزرار الصوت في جهازك",
    tapToPlay: "اضغط على زر التشغيل للبدء",
    surahList: "السور",
  },
  fr: {
    title: "Le Saint Coran",
    reciter: "Récitateur",
    searchPlaceholder: "Rechercher une sourate...",
    verses: "versets",
    backToList: "Liste des sourates",
    backToPlayer: "Retour au lecteur",
    loadingError: "Erreur de chargement",
    tryAnotherReciter: "Essayez un autre récitateur",
    playlist: "Playlist",
    useDeviceVolume: "Utilisez les boutons volume de votre appareil",
    tapToPlay: "Appuyez sur Play pour démarrer",
    surahList: "Sourates",
  },
  en: {
    title: "The Holy Quran",
    reciter: "Reciter",
    searchPlaceholder: "Search for a surah...",
    verses: "verses",
    backToList: "Surah list",
    backToPlayer: "Back to player",
    loadingError: "Loading error",
    tryAnotherReciter: "Try another reciter",
    playlist: "Playlist",
    useDeviceVolume: "Use your device volume buttons",
    tapToPlay: "Tap Play to start",
    surahList: "Surahs",
  }
};

// Liste des 114 sourates
const SURAHS = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", frenchName: "L'Ouverture", ayahs: 7, aliases: ["fatiha", "فاتحة", "الفاتحه", "ouverture"] },
  { number: 2, name: "البقرة", englishName: "Al-Baqara", frenchName: "La Vache", ayahs: 286, aliases: ["baqara", "ba9ara", "بقرة", "vache"] },
  { number: 3, name: "آل عمران", englishName: "Aal-Imran", frenchName: "La Famille d'Imran", ayahs: 200, aliases: ["imran", "عمران", "al imran"] },
  { number: 4, name: "النساء", englishName: "An-Nisa", frenchName: "Les Femmes", ayahs: 176, aliases: ["nisa", "نساء", "femmes"] },
  { number: 5, name: "المائدة", englishName: "Al-Ma'ida", frenchName: "La Table Servie", ayahs: 120, aliases: ["maida", "مائدة", "table"] },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", frenchName: "Les Bestiaux", ayahs: 165, aliases: ["anam", "انعام", "bestiaux"] },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", frenchName: "Les Murailles", ayahs: 206, aliases: ["araf", "اعراف"] },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", frenchName: "Le Butin", ayahs: 75, aliases: ["anfal", "انفال", "butin"] },
  { number: 9, name: "التوبة", englishName: "At-Tawba", frenchName: "Le Repentir", ayahs: 129, aliases: ["tawba", "tawbah", "توبة", "repentir"] },
  { number: 10, name: "يونس", englishName: "Yunus", frenchName: "Jonas", ayahs: 109, aliases: ["yunus", "younes", "يونس", "jonas"] },
  { number: 11, name: "هود", englishName: "Hud", frenchName: "Hud", ayahs: 123, aliases: ["hud", "houd", "هود"] },
  { number: 12, name: "يوسف", englishName: "Yusuf", frenchName: "Joseph", ayahs: 111, aliases: ["yusuf", "youssef", "يوسف", "joseph"] },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", frenchName: "Le Tonnerre", ayahs: 43, aliases: ["raad", "rad", "رعد", "tonnerre"] },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", frenchName: "Abraham", ayahs: 52, aliases: ["ibrahim", "ابراهيم", "abraham"] },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", frenchName: "Al-Hijr", ayahs: 99, aliases: ["hijr", "حجر"] },
  { number: 16, name: "النحل", englishName: "An-Nahl", frenchName: "Les Abeilles", ayahs: 128, aliases: ["nahl", "نحل", "abeilles"] },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", frenchName: "Le Voyage Nocturne", ayahs: 111, aliases: ["isra", "اسراء", "voyage nocturne"] },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", frenchName: "La Caverne", ayahs: 110, aliases: ["kahf", "كهف", "caverne"] },
  { number: 19, name: "مريم", englishName: "Maryam", frenchName: "Marie", ayahs: 98, aliases: ["maryam", "mariam", "مريم", "marie"] },
  { number: 20, name: "طه", englishName: "Ta-Ha", frenchName: "Ta-Ha", ayahs: 135, aliases: ["taha", "طه"] },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", frenchName: "Les Prophètes", ayahs: 112, aliases: ["anbiya", "انبياء", "prophètes"] },
  { number: 22, name: "الحج", englishName: "Al-Hajj", frenchName: "Le Pèlerinage", ayahs: 78, aliases: ["hajj", "حج", "pèlerinage"] },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", frenchName: "Les Croyants", ayahs: 118, aliases: ["muminun", "mominoun", "مؤمنون", "croyants"] },
  { number: 24, name: "النور", englishName: "An-Nur", frenchName: "La Lumière", ayahs: 64, aliases: ["nur", "nour", "نور", "lumière"] },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", frenchName: "Le Discernement", ayahs: 77, aliases: ["furqan", "فرقان", "discernement"] },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", frenchName: "Les Poètes", ayahs: 227, aliases: ["shuara", "شعراء", "poètes"] },
  { number: 27, name: "النمل", englishName: "An-Naml", frenchName: "Les Fourmis", ayahs: 93, aliases: ["naml", "نمل", "fourmis"] },
  { number: 28, name: "القصص", englishName: "Al-Qasas", frenchName: "Les Récits", ayahs: 88, aliases: ["qasas", "قصص", "récits"] },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut", frenchName: "L'Araignée", ayahs: 69, aliases: ["ankabut", "عنكبوت", "araignée"] },
  { number: 30, name: "الروم", englishName: "Ar-Rum", frenchName: "Les Romains", ayahs: 60, aliases: ["rum", "روم", "romains"] },
  { number: 31, name: "لقمان", englishName: "Luqman", frenchName: "Luqman", ayahs: 34, aliases: ["luqman", "loqman", "لقمان"] },
  { number: 32, name: "السجدة", englishName: "As-Sajda", frenchName: "La Prosternation", ayahs: 30, aliases: ["sajda", "سجدة", "prosternation"] },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", frenchName: "Les Coalisés", ayahs: 73, aliases: ["ahzab", "احزاب", "coalisés"] },
  { number: 34, name: "سبأ", englishName: "Saba", frenchName: "Saba", ayahs: 54, aliases: ["saba", "سبأ"] },
  { number: 35, name: "فاطر", englishName: "Fatir", frenchName: "Le Créateur", ayahs: 45, aliases: ["fatir", "فاطر", "créateur"] },
  { number: 36, name: "يس", englishName: "Ya-Sin", frenchName: "Ya-Sin", ayahs: 83, aliases: ["yasin", "yassin", "يس", "ya sin"] },
  { number: 37, name: "الصافات", englishName: "As-Saffat", frenchName: "Les Rangés", ayahs: 182, aliases: ["saffat", "صافات", "rangés"] },
  { number: 38, name: "ص", englishName: "Sad", frenchName: "Sad", ayahs: 88, aliases: ["sad", "ص"] },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", frenchName: "Les Groupes", ayahs: 75, aliases: ["zumar", "زمر", "groupes"] },
  { number: 40, name: "غافر", englishName: "Ghafir", frenchName: "Le Pardonneur", ayahs: 85, aliases: ["ghafir", "غافر", "pardonneur"] },
  { number: 41, name: "فصلت", englishName: "Fussilat", frenchName: "Les Versets Détaillés", ayahs: 54, aliases: ["fussilat", "فصلت", "détaillés"] },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", frenchName: "La Consultation", ayahs: 53, aliases: ["shura", "شورى", "consultation"] },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", frenchName: "L'Ornement", ayahs: 89, aliases: ["zukhruf", "زخرف", "ornements"] },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", frenchName: "La Fumée", ayahs: 59, aliases: ["dukhan", "دخان", "fumée"] },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiya", frenchName: "L'Agenouillée", ayahs: 37, aliases: ["jathiya", "جاثية", "agenouillée"] },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", frenchName: "Les Dunes", ayahs: 35, aliases: ["ahqaf", "احقاف", "dunes"] },
  { number: 47, name: "محمد", englishName: "Muhammad", frenchName: "Muhammad", ayahs: 38, aliases: ["muhammad", "mohammed", "محمد"] },
  { number: 48, name: "الفتح", englishName: "Al-Fath", frenchName: "La Victoire", ayahs: 29, aliases: ["fath", "فتح", "victoire"] },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", frenchName: "Les Appartements", ayahs: 18, aliases: ["hujurat", "حجرات", "appartements"] },
  { number: 50, name: "ق", englishName: "Qaf", frenchName: "Qaf", ayahs: 45, aliases: ["qaf", "ق"] },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", frenchName: "Les Vents", ayahs: 60, aliases: ["dhariyat", "ذاريات", "vents"] },
  { number: 52, name: "الطور", englishName: "At-Tur", frenchName: "Le Mont", ayahs: 49, aliases: ["tur", "طور", "mont"] },
  { number: 53, name: "النجم", englishName: "An-Najm", frenchName: "L'Étoile", ayahs: 62, aliases: ["najm", "نجم", "étoile"] },
  { number: 54, name: "القمر", englishName: "Al-Qamar", frenchName: "La Lune", ayahs: 55, aliases: ["qamar", "قمر", "lune"] },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", frenchName: "Le Miséricordieux", ayahs: 78, aliases: ["rahman", "رحمن", "miséricordieux"] },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'a", frenchName: "L'Événement", ayahs: 96, aliases: ["waqia", "واقعة", "événement"] },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", frenchName: "Le Fer", ayahs: 29, aliases: ["hadid", "حديد", "fer"] },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", frenchName: "La Discussion", ayahs: 22, aliases: ["mujadila", "مجادلة", "discussion"] },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", frenchName: "L'Exode", ayahs: 24, aliases: ["hashr", "حشر", "exode"] },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahina", frenchName: "L'Éprouvée", ayahs: 13, aliases: ["mumtahina", "ممتحنة", "éprouvée"] },
  { number: 61, name: "الصف", englishName: "As-Saff", frenchName: "Le Rang", ayahs: 14, aliases: ["saff", "صف", "rang"] },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'a", frenchName: "Le Vendredi", ayahs: 11, aliases: ["jumua", "جمعة", "vendredi"] },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", frenchName: "Les Hypocrites", ayahs: 11, aliases: ["munafiqun", "منافقون", "hypocrites"] },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", frenchName: "La Duperie", ayahs: 18, aliases: ["taghabun", "تغابن", "duperie"] },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", frenchName: "Le Divorce", ayahs: 12, aliases: ["talaq", "طلاق", "divorce"] },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", frenchName: "L'Interdiction", ayahs: 12, aliases: ["tahrim", "تحريم", "interdiction"] },
  { number: 67, name: "الملك", englishName: "Al-Mulk", frenchName: "La Royauté", ayahs: 30, aliases: ["mulk", "ملك", "royauté", "tabarak"] },
  { number: 68, name: "القلم", englishName: "Al-Qalam", frenchName: "La Plume", ayahs: 52, aliases: ["qalam", "قلم", "calame"] },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqa", frenchName: "L'Inévitable", ayahs: 52, aliases: ["haqqa", "حاقة", "inévitable"] },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", frenchName: "Les Voies d'Ascension", ayahs: 44, aliases: ["maarij", "معارج", "voies"] },
  { number: 71, name: "نوح", englishName: "Nuh", frenchName: "Noé", ayahs: 28, aliases: ["nuh", "nouh", "نوح", "noé"] },
  { number: 72, name: "الجن", englishName: "Al-Jinn", frenchName: "Les Djinns", ayahs: 28, aliases: ["jinn", "djinn", "جن"] },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", frenchName: "L'Enveloppé", ayahs: 20, aliases: ["muzzammil", "مزمل", "enveloppé"] },
  { number: 74, name: "المدثر", englishName: "Al-Muddathir", frenchName: "Le Revêtu", ayahs: 56, aliases: ["muddathir", "مدثر", "revêtu"] },
  { number: 75, name: "القيامة", englishName: "Al-Qiyama", frenchName: "La Résurrection", ayahs: 40, aliases: ["qiyama", "قيامة", "résurrection"] },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", frenchName: "L'Homme", ayahs: 31, aliases: ["insan", "انسان", "homme"] },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", frenchName: "Les Envoyés", ayahs: 50, aliases: ["mursalat", "مرسلات", "envoyés"] },
  { number: 78, name: "النبأ", englishName: "An-Naba", frenchName: "La Nouvelle", ayahs: 40, aliases: ["naba", "نبأ", "nouvelle"] },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", frenchName: "Les Anges Arracheurs", ayahs: 46, aliases: ["naziat", "نازعات", "arracheurs"] },
  { number: 80, name: "عبس", englishName: "Abasa", frenchName: "Il s'est Renfrogné", ayahs: 42, aliases: ["abasa", "عبس", "fronça"] },
  { number: 81, name: "التكوير", englishName: "At-Takwir", frenchName: "L'Obscurcissement", ayahs: 29, aliases: ["takwir", "تكوير", "obscurcissement"] },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", frenchName: "La Rupture", ayahs: 19, aliases: ["infitar", "انفطار", "rupture"] },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", frenchName: "Les Fraudeurs", ayahs: 36, aliases: ["mutaffifin", "مطففين", "fraudeurs"] },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", frenchName: "La Déchirure", ayahs: 25, aliases: ["inshiqaq", "انشقاق", "déchirure"] },
  { number: 85, name: "البروج", englishName: "Al-Buruj", frenchName: "Les Constellations", ayahs: 22, aliases: ["buruj", "بروج", "constellations"] },
  { number: 86, name: "الطارق", englishName: "At-Tariq", frenchName: "L'Astre Nocturne", ayahs: 17, aliases: ["tariq", "طارق", "astre"] },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", frenchName: "Le Très-Haut", ayahs: 19, aliases: ["ala", "اعلى", "très-haut"] },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiya", frenchName: "L'Enveloppante", ayahs: 26, aliases: ["ghashiya", "غاشية", "enveloppante"] },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", frenchName: "L'Aube", ayahs: 30, aliases: ["fajr", "فجر", "aube"] },
  { number: 90, name: "البلد", englishName: "Al-Balad", frenchName: "La Cité", ayahs: 20, aliases: ["balad", "بلد", "cité"] },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", frenchName: "Le Soleil", ayahs: 15, aliases: ["shams", "شمس", "soleil"] },
  { number: 92, name: "الليل", englishName: "Al-Layl", frenchName: "La Nuit", ayahs: 21, aliases: ["layl", "ليل", "nuit"] },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", frenchName: "Le Jour Montant", ayahs: 11, aliases: ["duha", "doha", "ضحى", "matinée"] },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", frenchName: "L'Ouverture", ayahs: 8, aliases: ["sharh", "شرح", "ouverture", "inshirah"] },
  { number: 95, name: "التين", englishName: "At-Tin", frenchName: "Le Figuier", ayahs: 8, aliases: ["tin", "تين", "figuier"] },
  { number: 96, name: "العلق", englishName: "Al-Alaq", frenchName: "L'Adhérence", ayahs: 19, aliases: ["alaq", "علق", "adhérence", "iqra"] },
  { number: 97, name: "القدر", englishName: "Al-Qadr", frenchName: "La Destinée", ayahs: 5, aliases: ["qadr", "قدر", "destinée"] },
  { number: 98, name: "البينة", englishName: "Al-Bayyina", frenchName: "La Preuve", ayahs: 8, aliases: ["bayyina", "بينة", "preuve"] },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzala", frenchName: "Le Tremblement", ayahs: 8, aliases: ["zalzala", "زلزلة", "tremblement"] },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", frenchName: "Les Coursiers", ayahs: 11, aliases: ["adiyat", "عاديات", "coursiers"] },
  { number: 101, name: "القارعة", englishName: "Al-Qari'a", frenchName: "Le Fracas", ayahs: 11, aliases: ["qaria", "قارعة", "fracas"] },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", frenchName: "La Course aux Richesses", ayahs: 8, aliases: ["takathur", "تكاثر", "rivalité"] },
  { number: 103, name: "العصر", englishName: "Al-Asr", frenchName: "Le Temps", ayahs: 3, aliases: ["asr", "عصر", "temps"] },
  { number: 104, name: "الهمزة", englishName: "Al-Humaza", frenchName: "Le Calomniateur", ayahs: 9, aliases: ["humaza", "همزة", "calomniateur"] },
  { number: 105, name: "الفيل", englishName: "Al-Fil", frenchName: "L'Éléphant", ayahs: 5, aliases: ["fil", "فيل", "éléphant"] },
  { number: 106, name: "قريش", englishName: "Quraysh", frenchName: "Quraysh", ayahs: 4, aliases: ["quraysh", "qoraych", "قريش"] },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", frenchName: "L'Ustensile", ayahs: 7, aliases: ["maun", "ماعون", "ustensiles"] },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", frenchName: "L'Abondance", ayahs: 3, aliases: ["kawthar", "كوثر", "abondance"] },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", frenchName: "Les Infidèles", ayahs: 6, aliases: ["kafirun", "kafiroun", "كافرون", "infidèles"] },
  { number: 110, name: "النصر", englishName: "An-Nasr", frenchName: "Le Secours", ayahs: 3, aliases: ["nasr", "نصر", "secours"] },
  { number: 111, name: "المسد", englishName: "Al-Masad", frenchName: "Les Fibres", ayahs: 5, aliases: ["masad", "lahab", "مسد", "fibres"] },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", frenchName: "Le Monothéisme Pur", ayahs: 4, aliases: ["ikhlas", "اخلاص", "sincérité", "qul hu allah"] },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", frenchName: "L'Aube Naissante", ayahs: 5, aliases: ["falaq", "فلق", "aube naissante"] },
  { number: 114, name: "الناس", englishName: "An-Nas", frenchName: "Les Hommes", ayahs: 6, aliases: ["nas", "ناس", "hommes"] },
];

// Récitateurs avec URLs MP3Quran
const RECITERS = [
  { id: "alafasy", name: "مشاري العفاسي", englishName: "Mishary Alafasy", server: "server8.mp3quran.net", path: "afs" },
  { id: "abdulbasit", name: "عبد الباسط عبد الصمد", englishName: "Abdul Basit", server: "server7.mp3quran.net", path: "basit" },
  { id: "sudais", name: "عبد الرحمن السديس", englishName: "Sudais", server: "server11.mp3quran.net", path: "sds" },
  { id: "shuraim", name: "سعود الشريم", englishName: "Shuraim", server: "server7.mp3quran.net", path: "shur" },
  { id: "ajamy", name: "أحمد العجمي", englishName: "Al-Ajamy", server: "server10.mp3quran.net", path: "ajm" },
  { id: "husary", name: "محمود خليل الحصري", englishName: "Al-Husary", server: "server13.mp3quran.net", path: "husr" },
  { id: "minshawi", name: "محمد صديق المنشاوي", englishName: "Al-Minshawi", server: "server10.mp3quran.net", path: "minsh" },
  { id: "maher", name: "ماهر المعيقلي", englishName: "Maher Al-Muaiqly", server: "server12.mp3quran.net", path: "maher" },
];

// Fonction de détection des demandes de récitation
export function detectQuranRequest(message) {
  const lowerMessage = message.toLowerCase();
  
  const recitationKeywords = [
    'récite', 'recite', 'reciter', 'réciter',
    'joue', 'jouer', 'play',
    'lis', 'lire', 'read',
    'écouter', 'ecouter', 'listen',
    'تلاوة', 'اقرأ', 'اسمع', 'شغل', 'رتل',
    'sourate', 'surah', 'sura', 'سورة',
  ];
  
  const hasRecitationKeyword = recitationKeywords.some(kw => lowerMessage.includes(kw));
  
  if (!hasRecitationKeyword) return null;
  
  const foundSurahs = [];
  const foundPositions = [];
  
  for (const surah of SURAHS) {
    let position = -1;
    
    if (message.includes(surah.name)) {
      position = message.indexOf(surah.name);
    }
    
    if (position === -1) {
      const engPos = lowerMessage.indexOf(surah.englishName.toLowerCase());
      if (engPos !== -1) position = engPos;
    }
    
    if (position === -1) {
      for (const alias of surah.aliases) {
        const aliasPos = lowerMessage.indexOf(alias.toLowerCase());
        if (aliasPos !== -1) {
          position = aliasPos;
          break;
        }
      }
    }
    
    if (position !== -1 && !foundSurahs.find(s => s.number === surah.number)) {
      foundSurahs.push(surah);
      foundPositions.push(position);
    }
  }
  
  const numberPattern = /sourate?\s*(\d+)|سورة\s*(\d+)|surah?\s*(\d+)/gi;
  let match;
  while ((match = numberPattern.exec(lowerMessage)) !== null) {
    const num = parseInt(match[1] || match[2] || match[3]);
    if (num >= 1 && num <= 114) {
      const surah = SURAHS.find(s => s.number === num);
      if (surah && !foundSurahs.find(s => s.number === surah.number)) {
        foundSurahs.push(surah);
        foundPositions.push(match.index);
      }
    }
  }
  
  if (foundSurahs.length === 0) return null;
  
  const sortedSurahs = foundSurahs
    .map((surah, i) => ({ surah, position: foundPositions[i] }))
    .sort((a, b) => a.position - b.position)
    .map(item => item.surah);
  
  return {
    isQuranRequest: true,
    surahs: sortedSurahs,
    playlist: sortedSurahs.map(s => s.number)
  };
}

// Composant QuranPlayer
export default function QuranPlayer({ isOpen, onClose, isRTL = true, language = 'ar', playlist = [], autoPlay = false }) {
  const t = translations[language] || translations.ar;
  
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSurahList, setShowSurahList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  
  const audioRef = useRef(null);

  // Détecter iOS
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
  }, []);

  // Obtenir le nom de la sourate selon la langue
  const getSurahName = (surah) => {
    if (language === 'ar') return surah.name;
    if (language === 'fr') return surah.frenchName || surah.englishName;
    return surah.englishName;
  };

  // Charger et jouer une sourate
  const playSurah = useCallback(async (surah) => {
    setSelectedSurah(surah);
    setIsLoading(true);
    setError(null);

    try {
      const surahNum = surah.number.toString().padStart(3, '0');
      const audioUrl = `https://${selectedReciter.server}/${selectedReciter.path}/${surahNum}.mp3`;
      
      console.log('Loading audio:', audioUrl);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playError) {
          console.log('Autoplay blocked, user must click play');
          setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('Error loading surah:', err);
      setError(t.loadingError);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReciter, t.loadingError]);

  // Initialiser avec la playlist
  useEffect(() => {
    if (isOpen && playlist.length > 0) {
      setCurrentPlaylist(playlist);
      setPlaylistIndex(0);
      setShowSurahList(false);
      const firstSurah = SURAHS.find(s => s.number === playlist[0]);
      if (firstSurah) {
        setSelectedSurah(firstSurah);
        if (autoPlay && !isIOS) {
          setTimeout(() => playSurah(firstSurah), 100);
        } else if (autoPlay && isIOS) {
          const surahNum = firstSurah.number.toString().padStart(3, '0');
          const audioUrl = `https://${selectedReciter.server}/${selectedReciter.path}/${surahNum}.mp3`;
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.load();
          }
        }
      }
    }
  }, [isOpen, playlist, autoPlay, playSurah, isIOS, selectedReciter]);

  // Filtrer les sourates
  const filteredSurahs = SURAHS.filter(surah => 
    surah.name.includes(searchQuery) || 
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (surah.frenchName && surah.frenchName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    surah.number.toString() === searchQuery ||
    surah.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Contrôles audio
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Navigation playlist
  const playNext = useCallback(() => {
    if (currentPlaylist.length > 0) {
      const nextIndex = playlistIndex + 1;
      if (nextIndex < currentPlaylist.length) {
        setPlaylistIndex(nextIndex);
        const nextSurah = SURAHS.find(s => s.number === currentPlaylist[nextIndex]);
        if (nextSurah) playSurah(nextSurah);
      }
    } else if (selectedSurah && selectedSurah.number < 114) {
      const nextSurah = SURAHS.find(s => s.number === selectedSurah.number + 1);
      if (nextSurah) playSurah(nextSurah);
    }
  }, [currentPlaylist, playlistIndex, selectedSurah, playSurah]);

  const playPrevious = useCallback(() => {
    if (currentPlaylist.length > 0) {
      const prevIndex = playlistIndex - 1;
      if (prevIndex >= 0) {
        setPlaylistIndex(prevIndex);
        const prevSurah = SURAHS.find(s => s.number === currentPlaylist[prevIndex]);
        if (prevSurah) playSurah(prevSurah);
      }
    } else if (selectedSurah && selectedSurah.number > 1) {
      const prevSurah = SURAHS.find(s => s.number === selectedSurah.number - 1);
      if (prevSurah) playSurah(prevSurah);
    }
  }, [currentPlaylist, playlistIndex, selectedSurah, playSurah]);

  const handleEnded = () => {
    setIsPlaying(false);
    playNext();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlaylist([]);
      setPlaylistIndex(0);
      setShowSurahList(true);
      setSelectedSurah(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">{t.title}</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Playlist indicator */}
        {currentPlaylist.length > 1 && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 flex items-center gap-2">
            <List className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">
              {t.playlist}: {playlistIndex + 1} / {currentPlaylist.length}
            </span>
          </div>
        )}

        {/* Audio element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => setError(t.loadingError)}
          playsInline
          webkit-playsinline="true"
          preload="auto"
        />

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Reciter selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.reciter}
            </label>
            <select
              value={selectedReciter.id}
              onChange={(e) => setSelectedReciter(RECITERS.find(r => r.id === e.target.value))}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {RECITERS.map(reciter => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name} - {reciter.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation entre liste et player */}
          {selectedSurah && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setShowSurahList(true)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  showSurahList 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
                {t.surahList}
              </button>
              <button
                onClick={() => setShowSurahList(false)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  !showSurahList 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Play className="w-4 h-4" />
                {t.backToPlayer}
              </button>
            </div>
          )}

          {/* Search - only in list view */}
          {showSurahList && (
            <div className="mb-4">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          )}

          {/* Surah list */}
          {showSurahList ? (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredSurahs.map(surah => (
                <button
                  key={surah.number}
                  onClick={() => {
                    playSurah(surah);
                    setShowSurahList(false);
                  }}
                  className={`w-full p-3 rounded-xl transition-colors flex items-center justify-between group ${
                    selectedSurah?.number === surah.number
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      selectedSurah?.number === surah.number
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}>
                      {surah.number}
                    </span>
                    <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="font-bold text-gray-900 dark:text-white">{surah.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{getSurahName(surah)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">{surah.ayahs} {t.verses}</div>
                </button>
              ))}
            </div>
          ) : (
            /* Player */
            <div className="space-y-4">
              {selectedSurah && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-2xl font-bold text-white">{selectedSurah.number}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSurah.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{getSurahName(selectedSurah)}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">{selectedReciter.name}</p>
                </div>
              )}

              {error && (
                <div className="text-center text-red-500 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {error} - {t.tryAnotherReciter}
                </div>
              )}

              {isIOS && !isPlaying && selectedSurah && !isLoading && (
                <div className="text-center text-amber-600 dark:text-amber-400 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                  📱 {t.tapToPlay}
                </div>
              )}

              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={playPrevious}
                  disabled={currentPlaylist.length > 0 ? playlistIndex <= 0 : (!selectedSurah || selectedSurah.number <= 1)}
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={isLoading || !selectedSurah}
                  className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  disabled={currentPlaylist.length > 0 ? playlistIndex >= currentPlaylist.length - 1 : (!selectedSurah || selectedSurah.number >= 114)}
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Volume - caché sur iOS */}
              {!isIOS && (
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={toggleMute} className="text-gray-500 dark:text-gray-400">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              )}
              
              {isIOS && (
                <p className="text-xs text-center text-gray-400 pt-2">
                  {t.useDeviceVolume}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
