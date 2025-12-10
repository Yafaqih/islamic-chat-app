import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Send, BookOpen, Sparkles, Star, X, Crown, Check, Zap, LogOut, MessageSquare, Shield, AlertCircle, Moon, Sun, Download, User, Navigation, Menu, Tag } from 'lucide-react';
import { exportCurrentConversationToPDF, exportConversationToPDF } from '../lib/pdfExport';
import PrayerNotification from '../components/PrayerNotification';
import ArabicTTS from '../components/ArabicTTS';
import AboutPage from '../components/AboutPage';
import AdminDashboard from '../components/AdminDashboard';
import SubscriptionModal from '../components/SubscriptionModal';
import InputBar from '../components/InputBar';
import QiblaModal from '../components/QiblaModal';
import QuranPlayer, { detectQuranRequest } from '../components/QuranPlayer';
import MosqueMap from '../components/MosqueMap';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

export default function IslamicChatApp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  
  // Hook de langue
  const { t, language, dir, isRTL } = useLanguage();

  const [darkMode, setDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Message de bienvenue dynamique selon la langue
  const getWelcomeMessage = () => ({
    id: 1,
    role: 'assistant',
    content: `${t('welcome')}\n\n${t('welcomeIntro')}\n\n• ${t('welcomeFeature1')}\n• ${t('welcomeFeature2')}\n• ${t('welcomeFeature3')}\n• ${t('welcomeFeature4')}\n\n${t('welcomeQuestion')}`,
    isFavorite: false,
    references: []
  });

  const [messages, setMessages] = useState([getWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [showAbout, setShowAbout] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [nextId, setNextId] = useState(2);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showQiblaModal, setShowQiblaModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showQuranPlayer, setShowQuranPlayer] = useState(false);
  const [quranPlaylist, setQuranPlaylist] = useState([]);
  const [showMosqueMap, setShowMosqueMap] = useState(false);
  const messagesEndRef = useRef(null);

  const FREE_MESSAGE_LIMIT = 10;
  const PRO_MESSAGE_LIMIT = 100;

  // Mettre à jour le message de bienvenue quand la langue change
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 1) {
      setMessages([getWelcomeMessage()]);
    }
  }, [language]);

  // Suggestions dynamiques selon la langue
  const suggestions = [
    t('suggestion1'),
    t('suggestion2'),
    t('suggestion3'),
    t('suggestion4')
  ];

  // Initialiser le mode sombre
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleExportPDF = () => {
    if (subscriptionTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }
    const title = messages.length > 1 ? messages[1].content.substring(0, 60) : t('newConversation');
    exportCurrentConversationToPDF(messages, user?.name, title);
  };

  const handleExportHistoricalPDF = async (conversationId) => {
    if (subscriptionTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      if (response.ok && data.conversation) {
        exportConversationToPDF(data.conversation, user?.name);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(t('errorOccurred'));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setSubscriptionTier(user.subscriptionTier || 'free');
      setMessageCount(user.messageCount || 0);
      loadConversations();
    }
  }, [isAuthenticated, user]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (response.ok) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      if (response.ok && data.conversation) {
        const loadedMessages = data.conversation.messages.map((msg, idx) => ({
          id: idx + 1,
          role: msg.role,
          content: msg.content,
          isFavorite: false,
          references: msg.references ? JSON.parse(msg.references) : []
        }));
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
        setNextId(loadedMessages.length + 1);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          setMessages([getWelcomeMessage()]);
          setCurrentConversationId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([getWelcomeMessage()]);
    setCurrentConversationId(null);
    setNextId(2);
    setShowHistory(false);
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    console.log('Files uploaded:', files);
  };

  // Convertir un fichier en base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async (filesFromInput = []) => {
    const messageText = input;
    const attachedFiles = Array.isArray(filesFromInput) ? filesFromInput : [];
    
    // Si pas de texte et pas de fichiers, ne rien faire
    if (!messageText.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;

    // Message par défaut si fichiers sans texte
    const displayMessage = messageText.trim() || (attachedFiles.length > 0 ? 
      (language === 'ar' ? '📎 ملف مرفق' : language === 'fr' ? '📎 Fichier joint' : '📎 Attached file') : '');

    // Convertir les images en base64 pour l'API
    const imageAttachments = [];
    for (const file of attachedFiles) {
      if (file.file && file.type?.startsWith('image/')) {
        try {
          const base64 = await fileToBase64(file.file);
          imageAttachments.push({
            type: 'image',
            name: file.name,
            mimeType: file.type,
            data: base64
          });
        } catch (err) {
          console.error('Error converting file to base64:', err);
        }
      }
    }

    // 🕌 DÉTECTION RÉCITATION CORAN
    const quranRequest = messageText.trim() ? detectQuranRequest(messageText) : null;
    if (quranRequest) {
      // Ouvrir le player avec la playlist
      setQuranPlaylist(quranRequest.playlist);
      setShowQuranPlayer(true);
      
      // Messages multilingues
      const quranMessages = {
        ar: { playing: 'جاري تشغيل', enjoy: 'استمتع بالتلاوة! يمكنك التحكم في المشغل.' },
        fr: { playing: 'Lecture en cours', enjoy: 'Profitez de la récitation ! Vous pouvez contrôler le lecteur.' },
        en: { playing: 'Now playing', enjoy: 'Enjoy the recitation! You can control the player.' }
      };
      const msg = quranMessages[language] || quranMessages.ar;
      
      // Ajouter les messages dans le chat
      const surahNames = quranRequest.surahs.map(s => s.name).join(' و ');
      const userMessage = {
        id: nextId,
        role: 'user',
        content: displayMessage,
        isFavorite: false,
        attachments: attachedFiles.length > 0 ? attachedFiles : undefined
      };
      const assistantMessage = {
        id: nextId + 1,
        role: 'assistant',
        content: `🕌 ${msg.playing}: ${surahNames}\n\n${msg.enjoy}`,
        isFavorite: false,
        quranPlaylist: quranRequest.playlist, // Stocker la playlist pour rejouer
        surahNames: surahNames
      };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setNextId(prev => prev + 2);
      setInput('');
      return; // Ne pas envoyer à l'API
    }

    const messageLimit = subscriptionTier === 'free' ? FREE_MESSAGE_LIMIT : 
                        subscriptionTier === 'pro' ? PRO_MESSAGE_LIMIT : Infinity;

    if (messageCount >= messageLimit && subscriptionTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }

    const userMessage = {
      id: nextId,
      role: 'user',
      content: displayMessage,
      isFavorite: false,
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setNextId(prev => prev + 1);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          userId: user?.id,
          language: language,
          images: imageAttachments.length > 0 ? imageAttachments : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage = {
          id: nextId + 1,
          role: 'assistant',
          content: data.message || data.response,
          isFavorite: false,
          references: data.references || []
        };
        setMessages(prev => [...prev, assistantMessage]);
        setNextId(prev => prev + 2);
        setMessageCount(data.messageCount || messageCount + 1);
        if (data.conversationId) {
          setCurrentConversationId(data.conversationId);
        }
      } else {
        console.error('Erreur:', data.error);
        const errorMessage = {
          id: nextId + 1,
          role: 'assistant',
          content: `${t('errorOccurred')}: ${data.error}`,
          isFavorite: false,
          references: []
        };
        setMessages(prev => [...prev, errorMessage]);
        setNextId(prev => prev + 2);
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        id: nextId + 1,
        role: 'assistant',
        content: t('connectionError'),
        isFavorite: false,
        references: []
      };
      setMessages(prev => [...prev, errorMessage]);
      setNextId(prev => prev + 2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    handleSend(suggestion);
  };

  const toggleFavorite = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isFavorite: !msg.isFavorite } : msg
    ));
  };

  const favoriteMessages = messages.filter(msg => msg.isFavorite);

  const getAuthenticityLevel = (reference) => {
    const refLower = reference.toLowerCase();
    if (refLower.includes('صحيح') || refLower.includes('sahih') || refLower.includes('authentique')) {
      return { label: t('sahih'), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: '✓' };
    }
    if (refLower.includes('حسن') || refLower.includes('hasan') || refLower.includes('bon')) {
      return { label: t('hasan'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '○' };
    }
    if (refLower.includes('ضعيف') || refLower.includes('daif') || refLower.includes('faible')) {
      return { label: t('daif'), color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '✗' };
    }
    return null;
  };

  // === PAGE NON AUTHENTIFIÉE ===
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4`} dir={dir}>
        <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl">
          {/* Language Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500 rounded-xl p-1">
              <LanguageSelector />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('appName')}</h1>
            <p className="text-gray-600 dark:text-gray-300">Ya Faqih</p>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-3 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{t('continueWithGoogle')}</span>
          </button>

          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            {t('loginWithEmail')}
          </button>

          <div className="mt-6 flex justify-center">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{darkMode ? t('lightMode') : t('darkMode')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === PAGE AUTHENTIFIÉE ===
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`} dir={dir}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">{t('appName')}</h1>
            </div>

            {/* Actions droite */}
            <div className={`flex items-center gap-1 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Boutons desktop */}
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setShowFavorites(true)} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title={t('favorites')}>
                  <Star className="w-5 h-5" />
                </button>
                <button onClick={() => setShowHistory(true)} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title={t('history')}>
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button onClick={handleExportPDF} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title={t('exportPDF')}>
                  <Download className="w-5 h-5" />
                </button>
                <button onClick={toggleDarkMode} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {/* User menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}</span>
                  </div>
                </button>

                {/* Dropdown */}
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-50`}>
                  {user?.role === 'admin' && (
                    <button onClick={() => setShowAdminDashboard(true)} className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <Shield className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="font-semibold">{t('adminDashboard')}</div>
                      </div>
                    </button>
                  )}
                  <button onClick={() => setShowPremiumModal(true)} className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <Tag className="w-5 h-5 text-emerald-500" />
                    <div>
                      <div className="font-semibold">{t('subscriptions')}</div>
                    </div>
                  </button>
                  <button onClick={() => setShowAbout(true)} className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-semibold">{t('about')}</div>
                    </div>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button onClick={() => signOut()} className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <LogOut className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">{t('logout')}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-3 pt-3 border-t border-white/20 flex gap-2">
              <button onClick={() => { setShowFavorites(true); setShowMobileMenu(false); }} className="flex-1 flex items-center justify-center gap-2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                <Star className="w-5 h-5" />
                <span className="text-sm">{t('favorites')}</span>
              </button>
              <button onClick={() => { setShowHistory(true); setShowMobileMenu(false); }} className="flex-1 flex items-center justify-center gap-2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">{t('history')}</span>
              </button>
              <button onClick={toggleDarkMode} className="flex-1 flex items-center justify-center gap-2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-sm">{darkMode ? t('lightMode') : t('darkMode')}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Subscription Modal */}
      {showPremiumModal && (
        <SubscriptionModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          currentTier={subscriptionTier}
          user={user}
        />
      )}

      {/* Qibla Modal */}
      {showQiblaModal && (
        <QiblaModal isOpen={true} onClose={() => setShowQiblaModal(false)} />
      )}

      {/* Prayer Modal */}
      {showPrayerModal && (
        <PrayerNotification 
          isOpen={true} 
          onClose={() => setShowPrayerModal(false)} 
          showFloatingButton={false}
        />
      )}

      {/* Quran Player Modal */}
      {showQuranPlayer && (
        <QuranPlayer
          isOpen={showQuranPlayer}
          onClose={() => {
            setShowQuranPlayer(false);
            setQuranPlaylist([]);
          }}
          isRTL={isRTL}
          language={language}
          playlist={quranPlaylist}
          autoPlay={true}
        />
      )}

      {/* Modal Historique */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('history')}</h2>
              <div className="flex items-center gap-2">
                <button onClick={startNewConversation} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors text-sm">
                  {t('newConversation')}
                </button>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div key={conv.id} className={`bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 ${currentConversationId === conv.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button onClick={() => deleteConversation(conv.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title={t('deleteConversation')}>
                        <X className="w-4 h-4" />
                      </button>
                      {subscriptionTier === 'premium' && (
                        <button onClick={() => handleExportHistoricalPDF(conv.id)} className="text-gray-400 hover:text-emerald-500 transition-colors p-1" title={t('exportPDF')}>
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <div onClick={() => loadConversation(conv.id)} className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">{conv.title || t('newConversation')}</p>
                        <div className={`flex items-center gap-2 ${isRTL ? 'justify-end' : 'justify-start'} text-xs`}>
                          {conv.messageCount && (<><span className="text-emerald-600 dark:text-emerald-400 font-medium">{conv.messageCount} {t('messages')}</span><span className="text-gray-400 dark:text-gray-500">•</span></>)}
                          <span className="text-gray-500 dark:text-gray-400">{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Favoris */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('favorites')}</h2>
              <button onClick={() => setShowFavorites(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
            </div>
            {favoriteMessages.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('noFavorites')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteMessages.map((msg) => (
                  <div key={msg.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                    <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{msg.role === 'user' ? t('you') : t('assistant')}</span>
                      <button onClick={() => toggleFavorite(msg.id)} className="text-yellow-500"><Star className="w-5 h-5 fill-current" /></button>
                    </div>
                    <p className={`text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone de messages - pt-20 pour compenser le header fixed */}
      <div className="max-w-4xl mx-auto p-4 pb-40 pt-20">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? (isRTL ? '' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : '')}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                {msg.role === 'user' ? <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'U'}</span> : <BookOpen className="w-5 h-5 text-white" />}
              </div>

              <div className="flex-1 max-w-3xl">
                <div className={`rounded-2xl p-6 ${msg.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'}`}>
                  <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{msg.role === 'user' ? t('you') : t('assistant')}</span>
                    <div className="flex items-center gap-2">
                      {msg.role === 'assistant' && <ArabicTTS text={msg.content} />}
                      {msg.role === 'assistant' && (
                        <button onClick={() => toggleFavorite(msg.id)} className="text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition-colors">
                          <Star className={`w-5 h-5 ${msg.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className={`text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>{msg.content}</p>

                  {/* Afficher les fichiers attachés */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`mt-3 flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {msg.attachments.map((file, idx) => (
                        <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-2 flex items-center gap-2 max-w-[200px]">
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded-lg" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.source === 'google-drive' ? 'Google Drive' : 'Local'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bouton Play pour rouvrir le Quran Player */}
                  {msg.quranPlaylist && msg.quranPlaylist.length > 0 && (
                    <button
                      onClick={() => {
                        setQuranPlaylist(msg.quranPlaylist);
                        setShowQuranPlayer(true);
                      }}
                      className={`mt-4 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="font-semibold text-sm">
                          {language === 'ar' ? 'إعادة تشغيل التلاوة' : language === 'fr' ? 'Relancer la récitation' : 'Replay recitation'}
                        </div>
                        <div className="text-xs text-white/80">{msg.surahNames}</div>
                      </div>
                    </button>
                  )}

                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('references')}</span>
                      </div>
                      <div className="space-y-2">
                        {msg.references.map((ref, idx) => {
                          const authenticity = getAuthenticityLevel(ref);
                          return (
                            <div key={idx} className={`bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100/50 dark:border-emerald-800/30 ${isRTL ? 'text-right' : 'text-left'}`}>
                              <div className={`flex items-start gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {authenticity && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${authenticity.color}`}>
                                    {authenticity.icon}{authenticity.label}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ref}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 max-w-3xl">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="mt-8 flex gap-4">
            <div className="flex-shrink-0 w-10"></div>
            <div className="flex-1 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((suggestion, idx) => (
                  <button key={idx} onClick={() => handleSuggestion(suggestion)} className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <Sparkles className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/95 dark:via-gray-900/95 to-transparent p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <InputBar
            value={input}
            onChange={setInput}
            onSend={(files) => handleSend(files)}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            disabled={false}
            placeholder={t('placeholder')}
            onQiblaClick={() => setShowQiblaModal(true)}
            onPrayerClick={() => setShowPrayerModal(true)}
            onQuranClick={() => {
              setQuranPlaylist([]);
              setShowQuranPlayer(true);
            }}
            onMosqueClick={() => setShowMosqueMap(true)}
          />
        </div>
      </div>

      {/* Modals */}
      {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
      
      {/* Carte des mosquées */}
      <MosqueMap
        isOpen={showMosqueMap}
        onClose={() => setShowMosqueMap(false)}
        language={language}
      />
      
      {showAdminDashboard && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/95">
          <AdminDashboard user={user} onLogout={() => { setShowAdminDashboard(false); signOut(); }} onClose={() => setShowAdminDashboard(false)} />
        </div>
      )}
    </div>
  );
}