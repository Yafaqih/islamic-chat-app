import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Composant TTS (Text-to-Speech) Multilingue pour Ya Faqih
 * Permet de lire les messages de l'assistant en arabe, français ou anglais
 * Utilise Web Speech API - 100% GRATUIT
 */
export default function ArabicTTS({ text, className = '' }) {
  const { language, t } = useLanguage();
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  // Mapping des langues pour le TTS
  const languageMapping = {
    ar: { code: 'ar-SA', name: 'العربية' },
    fr: { code: 'fr-FR', name: 'Français' },
    en: { code: 'en-US', name: 'English' }
  };

  // Traductions pour le composant
  const ttsTranslations = {
    ar: {
      listen: 'استمع للرسالة',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      stop: 'إيقاف',
      settings: 'الإعدادات',
      voiceSettings: 'إعدادات الصوت',
      voice: 'الصوت',
      available: 'متاح',
      speed: 'السرعة',
      pitch: 'النبرة',
      volume: 'الصوت',
      tip: '💡 للحصول على أفضل جودة، قم بتثبيت صوت عربي عالي الجودة على جهازك من إعدادات النظام',
      noVoice: '❌ لا يوجد صوت متاح. قم بتثبيت صوت في إعدادات النظام.'
    },
    fr: {
      listen: 'Écouter le message',
      pause: 'Pause',
      resume: 'Reprendre',
      stop: 'Arrêter',
      settings: 'Paramètres',
      voiceSettings: 'Paramètres vocaux',
      voice: 'Voix',
      available: 'disponible(s)',
      speed: 'Vitesse',
      pitch: 'Tonalité',
      volume: 'Volume',
      tip: '💡 Pour une meilleure qualité, installez une voix de haute qualité dans les paramètres système',
      noVoice: '❌ Aucune voix disponible. Installez une voix dans les paramètres système.'
    },
    en: {
      listen: 'Listen to message',
      pause: 'Pause',
      resume: 'Resume',
      stop: 'Stop',
      settings: 'Settings',
      voiceSettings: 'Voice Settings',
      voice: 'Voice',
      available: 'available',
      speed: 'Speed',
      pitch: 'Pitch',
      volume: 'Volume',
      tip: '💡 For best quality, install a high-quality voice in your system settings',
      noVoice: '❌ No voice available. Install a voice in system settings.'
    }
  };

  const tts = ttsTranslations[language] || ttsTranslations.ar;
  const currentLangCode = languageMapping[language]?.code || 'ar-SA';

  // Charger les voix disponibles
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // Filtrer les voix par langue actuelle
      const filteredVoices = availableVoices.filter(voice => 
        voice.lang.startsWith(language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en')
      );
      
      setVoices(filteredVoices);
      
      // Sélectionner automatiquement la meilleure voix
      if (filteredVoices.length > 0) {
        const premiumVoice = filteredVoices.find(v => 
          v.name.includes('Premium') || v.name.includes('Enhanced') || v.name.includes('Google')
        ) || filteredVoices[0];
        setSelectedVoice(premiumVoice);
      } else {
        setSelectedVoice(null);
      }
    };

    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [language]);

  // Fonction pour parler
  const speak = () => {
    if (!text?.trim()) return;

    if (voices.length === 0) {
      alert(tts.noVoice);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = currentLangCode;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Erreur TTS:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Si aucune voix n'est disponible, ne rien afficher
  if (voices.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Bouton principal */}
      {!isSpeaking ? (
        <button
          onClick={speak}
          className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-all group"
          title={tts.listen}
        >
          <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      ) : (
        <>
          <button
            onClick={togglePause}
            className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 transition-all"
            title={isPaused ? tts.resume : tts.pause}
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={stop}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all"
            title={tts.stop}
          >
            <VolumeX className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Bouton paramètres */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
        title={tts.settings}
      >
        <SettingsIcon className="w-4 h-4" />
      </button>

      {/* Modal de paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{tts.voiceSettings}</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Sélection de voix */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {tts.voice} ({voices.length} {tts.available})
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice);
                  }}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                >
                  {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vitesse */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {rate.toFixed(1)}x
                  </span>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {tts.speed}
                  </label>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Tonalité */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {pitch.toFixed(1)}
                  </span>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {tts.pitch}
                  </label>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Volume */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {Math.round(volume * 100)}%
                  </span>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {tts.volume}
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            {/* Note d'aide */}
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg">
              <p className={`text-xs text-blue-800 dark:text-blue-200 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {tts.tip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de lecture */}
      {isSpeaking && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  );
}
