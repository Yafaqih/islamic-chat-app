import React, { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Send, BookOpen, Sparkles, Star, X, Crown, Check, Zap, LogOut, MessageSquare, Shield, AlertCircle, Moon, Sun, Download, User, Navigation, Menu, Tag } from 'lucide-react';
import { exportCurrentConversationToPDF, exportConversationToPDF } from '../lib/pdfExport';
import PrayerNotification from '../components/PrayerNotification';
// ✨ Import du composant TTS
import ArabicTTS from '../components/ArabicTTS';
import AboutPage from '../components/AboutPage';

import AdminDashboard from '../components/AdminDashboard';
import SubscriptionModal from '../components/SubscriptionModal';
import InputBar from '../components/InputBar'; // ✅ NOUVEAU: Barre d'input style Claude
import QiblaModal from '../components/QiblaModal'; // ✅ NOUVEAU: Modal Qibla

export default function IslamicChatApp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const [darkMode, setDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'السلام عليكم ورحمة الله وبركاته\n\nمرحباً بك! أنا مساعدك الإسلامي المتخصص في التقاليد السنية. يمكنني مساعدتك في:\n\n• تفسير آيات القرآن الكريم\n• شرح الأحاديث الصحيحة\n• إعداد الخطب\n• أسئلة الفقه الإسلامي\n\nكيف يمكنني مساعدتك اليوم؟',
      isFavorite: false,
      references: []
    }
  ]);
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
  const [showQiblaModal, setShowQiblaModal] = useState(false); // ✅ NOUVEAU: État pour le modal Qibla
  const [uploadedFiles, setUploadedFiles] = useState([]); // ✅ NOUVEAU: Fichiers uploadés
  const messagesEndRef = useRef(null);

  // ⭐ NOUVEAU: Ref pour éviter les double-exécutions de l'auto-prompt
  const hasAutoSubmitted = useRef(false);

  const FREE_MESSAGE_LIMIT = 10;
  const PRO_MESSAGE_LIMIT = 100;

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

  // ⭐ NOUVEAU: Auto-exécution du prompt depuis l'URL (pages SEO)
  useEffect(() => {
    // Attendre que l'utilisateur soit authentifié et que le composant soit prêt
    if (status !== "authenticated" || isLoading) return;
    
    const { prompt } = router.query;
    
    if (prompt && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      
      // Décoder le prompt (au cas où il serait encodé dans l'URL)
      const decodedPrompt = decodeURIComponent(prompt);
      
      console.log('🚀 Auto-executing prompt from URL:', decodedPrompt);
      
      // Exécuter le prompt automatiquement
      handleSend(decodedPrompt);
      
      // Nettoyer l'URL (enlever ?prompt=...)
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.query, status, isLoading]);

  // ⭐ NOUVEAU: Reset le flag quand on navigue
  useEffect(() => {
    const handleRouteChange = () => {
      hasAutoSubmitted.current = false;
    };
    
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

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
    const title = messages.length > 1 ? messages[1].content.substring(0, 60) : 'محادثة جديدة';
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
      alert('خطأ في تصدير المحادثة');
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

  const suggestions = [
    "اشرح لي سورة الفاتحة",
    "أعطني خطبة عن الصبر",
    "اشرح حديث النية",
    "ما أهمية يوم الجمعة؟"
  ];

  // ✅ NOUVEAU: Gestion des fichiers uploadés
  const handleFileUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    // TODO: Envoyer les fichiers au serveur pour traitement
    console.log('Files uploaded:', files);
  };

  // ⭐ MODIFIÉ: handleSend accepte maintenant un paramètre optionnel
  const handleSend = async (directMessage = null) => {
    // Utiliser le message direct s'il est fourni, sinon utiliser l'input
    const messageText = directMessage || input;
    
    if (!messageText.trim() || isLoading) return;

    const messageLimit = subscriptionTier === 'free' ? FREE_MESSAGE_LIMIT : 
                        subscriptionTier === 'pro' ? PRO_MESSAGE_LIMIT : Infinity;

    if (messageCount >= messageLimit) {
      setShowPremiumModal(true);
      return;
    }

    const userMessage = { id: nextId, role: 'user', content: messageText, isFavorite: false, references: [] };
    setMessages(prev => [...prev, userMessage]);
    setNextId(nextId + 1);
    setInput(''); // Vider l'input dans tous les cas
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          subscriptionTier,
          userId: user?.id,
          files: uploadedFiles.map(f => f.name) // Envoyer les noms des fichiers
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur serveur');
      }

      const assistantMessage = {
        id: nextId + 1,
        role: 'assistant',
        content: data.response,
        isFavorite: false,
        references: data.references || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      setNextId(prev => prev + 2);
      
      if (data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }

      // Mettre à jour les stats d'utilisation si disponibles
      if (data.usage) {
        setMessageCount(data.usage.messagesUsed);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: nextId + 1,
        role: 'assistant',
        content: `عذراً، حدث خطأ: ${error.message}`,
        isFavorite: false,
        references: []
      };
      setMessages(prev => [...prev, errorMessage]);
      setNextId(prev => prev + 2);
    } finally {
      setIsLoading(false);
      setUploadedFiles([]); // Vider les fichiers après envoi
    }
  };

  const handleSuggestion = (suggestion) => {
    handleSend(suggestion);
  };

  const toggleFavorite = (id) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isFavorite: !msg.isFavorite } : msg
    ));
  };

  const favoriteMessages = messages.filter(msg => msg.isFavorite);

  const getAuthenticityLevel = (reference) => {
    const lowerRef = reference.toLowerCase();
    if (lowerRef.includes('صحيح البخاري') || lowerRef.includes('صحيح مسلم')) {
      return { label: 'صحيح', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', icon: '✓' };
    }
    if (lowerRef.includes('سنن') || lowerRef.includes('مسند')) {
      return { label: 'حسن', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', icon: '○' };
    }
    if (lowerRef.includes('سورة') || lowerRef.includes('آية') || lowerRef.includes(':')) {
      return { label: 'قرآن', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', icon: '📖' };
    }
    return null;
  };

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
        
        // Ajouter le message de bienvenue au début si nécessaire
        if (loadedMessages.length > 0 && loadedMessages[0].role !== 'assistant') {
          loadedMessages.unshift({
            id: 0,
            role: 'assistant',
            content: 'السلام عليكم ورحمة الله وبركاته\n\nمرحباً بك! أنا مساعدك الإسلامي.',
            isFavorite: false,
            references: []
          });
        }
        
        setMessages(loadedMessages);
        setNextId(loadedMessages.length + 1);
        setCurrentConversationId(conversationId);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!confirm('هل تريد حذف هذه المحادثة؟')) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          startNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([{
      id: 1,
      role: 'assistant',
      content: 'السلام عليكم ورحمة الله وبركاته\n\nمرحباً بك! أنا مساعدك الإسلامي المتخصص في التقاليد السنية. يمكنني مساعدتك في:\n\n• تفسير آيات القرآن الكريم\n• شرح الأحاديث الصحيحة\n• إعداد الخطب\n• أسئلة الفقه الإسلامي\n\nكيف يمكنني مساعدتك اليوم؟',
      isFavorite: false,
      references: []
    }]);
    setNextId(2);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  // Page de connexion
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">يا فقيه</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">مساعدك الإسلامي الذكي</p>
          
          <button
            onClick={() => signIn('google')}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 dark:text-gray-200 font-medium">تسجيل الدخول بحساب Google</span>
          </button>
          
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            بالتسجيل، أنت توافق على شروط الاستخدام
          </p>
        </div>
      </div>
    );
  }

  // Application principale
  return (
    <div dir="rtl" className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300`}>
      {/* En-tête */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">يا فقيه</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">مساعدك الإسلامي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton Dark Mode */}
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            {/* Bouton Export PDF */}
            {subscriptionTier === 'premium' && (
              <button onClick={handleExportPDF} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="تصدير PDF">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}

            {/* Bouton Historique */}
            <button onClick={() => { loadConversations(); setShowHistory(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Bouton Favoris */}
            <button onClick={() => setShowFavorites(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <Star className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {favoriteMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                  {favoriteMessages.length}
                </span>
              )}
            </button>

            {/* Bouton Premium */}
            <button onClick={() => setShowPremiumModal(true)} className={`p-2 rounded-lg transition-colors ${subscriptionTier === 'premium' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : subscriptionTier === 'pro' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Crown className={`w-5 h-5 ${subscriptionTier !== 'free' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
            </button>

            {/* Menu Mobile */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Menu Utilisateur Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setShowAbout(true)} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                حول
              </button>
              {user?.role === 'ADMIN' && (
                <button onClick={() => setShowAdminDashboard(true)} className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  إدارة
                </button>
              )}
              <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{subscriptionTier === 'premium' ? 'بريميوم' : subscriptionTier === 'pro' ? 'برو' : 'مجاني'}</p>
                </div>
              </div>
              <button onClick={() => { setShowAbout(true); setShowMobileMenu(false); }} className="w-full text-right p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                حول التطبيق
              </button>
              {user?.role === 'ADMIN' && (
                <button onClick={() => { setShowAdminDashboard(true); setShowMobileMenu(false); }} className="w-full text-right p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-purple-600 dark:text-purple-400 flex items-center gap-2 justify-end">
                  <span>لوحة الإدارة</span>
                  <Shield className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => signOut()} className="w-full text-right p-3 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2 justify-end">
                <span>تسجيل الخروج</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Barre de progression des messages */}
        {subscriptionTier !== 'premium' && (
          <div className="max-w-6xl mx-auto px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {messageCount} / {subscriptionTier === 'pro' ? PRO_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT} رسالة
              </span>
              <div className="flex-1 mx-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    messageCount >= (subscriptionTier === 'pro' ? PRO_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT) * 0.8 
                      ? 'bg-red-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(messageCount / (subscriptionTier === 'pro' ? PRO_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT)) * 100}%` }}
                />
              </div>
              <button onClick={() => setShowPremiumModal(true)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                ترقية
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Notifications de prière */}
      <PrayerNotification />

      {/* Modal Premium/Subscription */}
      {showPremiumModal && (
        <SubscriptionModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          currentTier={subscriptionTier}
          messageCount={messageCount}
          messageLimit={subscriptionTier === 'pro' ? PRO_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT}
        />
      )}

      {/* Modal Qibla */}
      {showQiblaModal && (
        <QiblaModal onClose={() => setShowQiblaModal(false)} />
      )}

      {/* Espacement pour le header fixe */}
      <div className={`${subscriptionTier !== 'premium' ? 'pt-28' : 'pt-20'}`}></div>

      {/* Modal Historique */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">المحادثات السابقة</h2>
              <button onClick={startNewConversation} className="text-emerald-600 dark:text-emerald-400 text-sm hover:underline">
                محادثة جديدة
              </button>
            </div>
            
            {conversations.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد محادثات سابقة</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
                {conversations.map((conv) => (
                  <div key={conv.id} className="group bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all cursor-pointer">
                    <div className="p-4 flex items-start gap-3">
                      {subscriptionTier === 'premium' && (
                        <button onClick={(e) => handleExportHistoricalPDF(conv.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all" title="تصدير PDF">
                          <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      )}
                      <button onClick={(e) => deleteConversation(conv.id, e)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                      <div onClick={() => loadConversation(conv.id)} className="flex-1 text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">{conv.title || 'محادثة جديدة'}</p>
                        <div className="flex items-center gap-2 justify-end text-xs">
                          {conv.messageCount && (<><span className="text-emerald-600 dark:text-emerald-400 font-medium">{conv.messageCount} رسائل</span><span className="text-gray-400 dark:text-gray-500">•</span></>)}
                          <span className="text-gray-500 dark:text-gray-400">{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}</span>
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
            <div className="flex justify-between items-center mb-6 flex-row-reverse">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المفضلة</h2>
              <button onClick={() => setShowFavorites(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
            </div>
            {favoriteMessages.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد رسائل مفضلة بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteMessages.map((msg) => (
                  <div key={msg.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-2 flex-row-reverse">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{msg.role === 'user' ? 'أنت' : 'المساعد'}</span>
                      <button onClick={() => toggleFavorite(msg.id)} className="text-yellow-500"><Star className="w-5 h-5 fill-current" /></button>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 text-right whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone de messages */}
      <div className="max-w-4xl mx-auto p-4 pb-40">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                {msg.role === 'user' ? <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'U'}</span> : <BookOpen className="w-5 h-5 text-white" />}
              </div>

              <div className="flex-1 max-w-3xl">
                <div className={`rounded-2xl p-6 ${msg.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-2 flex-row-reverse">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{msg.role === 'user' ? 'أنت' : 'المساعد الإسلامي'}</span>
                    <div className="flex items-center gap-2">
                      {msg.role === 'assistant' && <ArabicTTS text={msg.content} />}
                      {msg.role === 'assistant' && (
                        <button onClick={() => toggleFavorite(msg.id)} className="text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition-colors">
                          <Star className={`w-5 h-5 ${msg.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-800 dark:text-gray-200 text-right whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3 flex-row-reverse">
                        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">المراجع</span>
                      </div>
                      <div className="space-y-2">
                        {msg.references.map((ref, idx) => {
                          const authenticity = getAuthenticityLevel(ref);
                          return (
                            <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-3 text-right border border-emerald-100/50 dark:border-emerald-800/30">
                              <div className="flex items-start gap-2 flex-row-reverse mb-1">
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
            <div className="flex gap-4">
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
            {/* Espace pour l'avatar (même largeur que l'avatar du message) */}
            <div className="flex-shrink-0 w-10"></div>
            {/* Grille des suggestions */}
            <div className="flex-1 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((suggestion, idx) => (
                  <button key={idx} onClick={() => handleSuggestion(suggestion)} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                    <div className="flex items-center gap-3 flex-row-reverse justify-end">
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

      {/* ✅ NOUVELLE BARRE D'INPUT STYLE CLAUDE */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/95 dark:via-gray-900/95 to-transparent p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <InputBar
            value={input}
            onChange={setInput}
            onSend={() => handleSend()}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            disabled={false}
            placeholder="اكتب سؤالك هنا..."
            onQiblaClick={() => setShowQiblaModal(true)}
          />
        </div>
      </div>

      {/* Modals */}
      {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
      
      {showAdminDashboard && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/95">
          <AdminDashboard user={user} onLogout={() => { setShowAdminDashboard(false); signOut(); }} onClose={() => setShowAdminDashboard(false)} />
        </div>
      )}
    </div>
  );
}
