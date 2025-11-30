/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',        // Si tu utilises l’app router
    './src/**/*.{js,ts,jsx,tsx,mdx}',         // Si tu as un dossier src
  ],
  darkMode: 'class', // Garde le mode sombre activé

  theme: {
    extend: {
      // Couleurs islamiques officielles
      colors: {
        islamic: {
          green: '#006400',      // Vert mecquois classique
          dark: '#0a1a0a',       // Fond sombre profond
          light: '#f0fdf4',      // Fond clair pour mode clair
          accent: '#22c55e',     // Vert clair pour boutons hover
          gold: '#fbbf24',       // Or pour titres et accents
        },
      },

      // Police arabe parfaite (Noto Naskh Arabic)
      fontFamily: {
        arabic: ["'Noto Naskh Arabic'", "serif"],
        quran: ["'Scheherazade New'", "serif"], // Option pour versets
      },

      // Espacements et tailles optimisés mobile-first
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // Animation douce pour la boussole et les cartes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out forwards',
      },
    },
  },

  plugins: [],
}