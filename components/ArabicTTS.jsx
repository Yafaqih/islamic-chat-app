import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Settings as SettingsIcon } from 'lucide-react';

/**
 * Composant TTS (Text-to-Speech) pour Ya Faqih
 * Permet de lire les messages de l'assistant en arabe
 * Utilise Web Speech API - 100% GRATUIT
 */
export default function ArabicTTS({ text, className = '' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(0.9); // Légèrement plus lent pour meilleure prononciation arabe
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  // Charger les voix disponibles
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const arabicVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('ar')
      );
      
      setVoices(arabicVoices);
      
      // Sélectionner automatiquement la meilleure voix arabe
      if (arabicVoices.length > 0 && !selectedVoice) {
        // Prioriser les voix de haute qualité
        const premiumVoice = arabicVoices.find(v => 
          v.name.includes('Premium') || v.name.includes('Enhanced')
        ) || arabicVoices[0];
        setSelectedVoice(premiumVoice);
      }
    };

    loadVoices();
    
    // Les voix peuvent se charger de manière asynchrone
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  // Fonction pour parler
  const speak = () => {
    if (!text?.trim()) return;

    if (voices.length === 0) {
      alert('❌ Aucune voix arabe disponible. Installez une voix arabe dans les paramètres de votre système.');
      return;
    }

    // Arrêter si déjà en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configuration
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = 'ar-SA'; // Arabe standard

    // Événements
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

  // Pause/Reprendre
  const togglePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Arrêter
  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Si aucune voix arabe n'est disponible, ne rien afficher
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
          title="استمع للرسالة"
        >
          <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      ) : (
        <>
          <button
            onClick={togglePause}
            className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 transition-all"
            title={isPaused ? "استئناف" : "إيقاف مؤقت"}
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
            title="إيقاف"
          >
            <VolumeX className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Bouton paramètres */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
        title="الإعدادات"
      >
        <SettingsIcon className="w-4 h-4" />
      </button>

      {/* Modal de paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">إعدادات الصوت</h3>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                  الصوت ({voices.length} متاح)
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice);
                  }}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-right"
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
                    السرعة
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
                    النبرة
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
                    الصوت
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
              <p className="text-xs text-blue-800 dark:text-blue-200 text-right leading-relaxed">
                💡 للحصول على أفضل جودة، قم بتثبيت صوت عربي عالي الجودة على جهازك من إعدادات النظام
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