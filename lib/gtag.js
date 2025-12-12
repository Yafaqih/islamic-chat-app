// lib/gtag.js - Google Analytics pour Ya Faqih

export const GA_MEASUREMENT_ID = 'G-R4N29NRJ6Z';

// Vérifier si GA est disponible
const isGAAvailable = () => {
  return typeof window !== 'undefined' && window.gtag;
};

// Page view
export const pageview = (url) => {
  if (!isGAAvailable()) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Événement générique
export const event = ({ action, category, label, value }) => {
  if (!isGAAvailable()) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// ═══════════════════════════════════════════════════════════
// ÉVÉNEMENTS YA FAQIH
// ═══════════════════════════════════════════════════════════

// 💬 Message envoyé
export const trackMessage = (language = 'ar') => {
  event({
    action: 'send_message',
    category: 'engagement',
    label: language,
  });
};

// 🕌 Écoute du Coran
export const trackQuranRecitation = (surahName) => {
  event({
    action: 'quran_listen',
    category: 'engagement',
    label: surahName,
  });
};

// 🔬 Scanner Halal
export const trackHalalScan = (status) => {
  event({
    action: 'halal_scan',
    category: 'scanner',
    label: status,
  });
};

// 🧭 Qibla
export const trackQiblaUse = () => {
  event({
    action: 'qibla_compass',
    category: 'feature',
    label: 'used',
  });
};

// 🕌 Mosquées
export const trackMosqueFinder = () => {
  event({
    action: 'mosque_finder',
    category: 'feature',
    label: 'used',
  });
};

// 🕐 Heures de prière
export const trackPrayerTimes = () => {
  event({
    action: 'prayer_times',
    category: 'feature',
    label: 'viewed',
  });
};

// 👤 Connexion
export const trackLogin = (method) => {
  event({
    action: 'login',
    category: 'conversion',
    label: method,
  });
};

// 👑 Premium click
export const trackPremiumClick = (tier) => {
  event({
    action: 'premium_click',
    category: 'conversion',
    label: tier,
  });
};

// 💝 Don
export const trackDonationClick = () => {
  event({
    action: 'donation_click',
    category: 'conversion',
    label: 'lemonsqueezy',
  });
};

// 📄 Export PDF
export const trackExportPDF = () => {
  event({
    action: 'export_pdf',
    category: 'feature',
    label: 'conversation',
  });
};

// 🌙 Mode sombre
export const trackThemeChange = (theme) => {
  event({
    action: 'theme_change',
    category: 'settings',
    label: theme,
  });
};

// 🌍 Changement de langue
export const trackLanguageChange = (toLang) => {
  event({
    action: 'language_change',
    category: 'settings',
    label: toLang,
  });
};

// ⭐ Favoris
export const trackFavorite = (action) => {
  event({
    action: 'favorite',
    category: 'engagement',
    label: action,
  });
};
