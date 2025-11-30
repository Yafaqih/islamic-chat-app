import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

/**
 * Composant de Reconnaissance Vocale Arabe pour Ya Faqih
 * Permet aux utilisateurs de dicter leurs questions au lieu de les taper
 * Utilise Web Speech API - 100% GRATUIT
 */
export default function VoiceRecognition({ onTranscript, language = 'ar-SA' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Vérifier le support et initialiser
  useEffect(() => {
    // Vérifier si la reconnaissance vocale est supportée
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Créer l'instance de reconnaissance vocale
      const recognition = new SpeechRecognition();
      
      // Configuration
      recognition.continuous = true; // Continue d'écouter
      recognition.interimResults = true; // Résultats intermédiaires
      recognition.lang = language; // Langue arabe
      recognition.maxAlternatives = 1;

      // Événement : Résultat de la reconnaissance
      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalText += transcriptPart + ' ';
          } else {
            interimText += transcriptPart;
          }
        }

        // Mettre à jour les états
        if (finalText) {
          setTranscript(prev => prev + finalText);
          setInterimTranscript('');
          
          // Envoyer le texte final au parent
          if (onTranscript) {
            onTranscript(transcript + finalText);
          }
        } else {
          setInterimTranscript(interimText);
        }
      };

      // Événement : Erreur
      recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        
        if (event.error === 'no-speech') {
          // Pas de parole détectée, continuer d'écouter
          console.log('Aucune parole détectée, continuez de parler...');
        } else if (event.error === 'not-allowed') {
          alert('❌ Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.');
          setIsListening(false);
        } else {
          setIsListening(false);
        }
      };

      // Événement : Fin de la reconnaissance
      recognition.onend = () => {
        if (isListening) {
          // Redémarrer automatiquement si on est censé écouter
          try {
            recognition.start();
          } catch (e) {
            console.log('Reconnaissance déjà en cours');
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('La reconnaissance vocale n\'est pas supportée par ce navigateur.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isListening, transcript, onTranscript]);

  // Démarrer l'écoute
  const startListening = () => {
    if (!recognitionRef.current) return;

    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Erreur au démarrage:', error);
    }
  };

  // Arrêter l'écoute
  const stopListening = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);

    // Envoyer le texte final au parent
    const finalText = (transcript + ' ' + interimTranscript).trim();
    if (finalText && onTranscript) {
      onTranscript(finalText);
    }
  };

  // Si non supporté, ne rien afficher
  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`relative p-2 rounded-lg transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
        title={isListening ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        
        {/* Indicateur d'écoute */}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Affichage du texte en cours de reconnaissance */}
      {(isListening || transcript || interimTranscript) && (
        <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[300px] max-w-[400px]">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className={`w-4 h-4 text-emerald-600 ${isListening ? 'animate-spin' : 'hidden'}`} />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {isListening ? 'جاري الاستماع...' : 'تم التسجيل'}
            </span>
          </div>
          
          <div className="text-right">
            {/* Texte final */}
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {transcript}
              {/* Texte intermédiaire (en cours) */}
              <span className="text-gray-400 dark:text-gray-500 italic">
                {interimTranscript}
              </span>
            </p>
          </div>

          {isListening && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                💡 تحدث بوضوح... اضغط على الميكروفون للإيقاف
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}