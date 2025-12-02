import React, { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Send, BookOpen, Sparkles, Star, X, Crown, Check, Zap, LogOut, MessageSquare, Shield, AlertCircle, Moon, Sun, Download, User, Navigation, Menu } from 'lucide-react';
import { exportCurrentConversationToPDF, exportConversationToPDF } from '../lib/pdfExport';
import QiblaCompass from '../components/QiblaCompass';
import PrayerButton from '../components/PrayerButton';
// ✨ NOUVEAU: Import du composant TTS
import ArabicTTS from '../components/ArabicTTS';
// ✨ NOUVEAU: Import du composant de reconnaissance vocale
import VoiceRecognition from '../components/VoiceRecognition';
import AboutPage from '../components/AboutPage';

export default function IslamicChatApp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  // ✨ NOUVEAU: État pour le mode sombre
  const [darkMode, setDarkMode] = useState(false);
  
  // ✨ NOUVEAU: État pour le menu mobile
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
  const [showAbout, setShowAbout] = useState(false)
  const [messageCount, setMessageCount] = useState(0);
  const [nextId, setNextId] = useState(2);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const FREE_MESSAGE_LIMIT = 10;
  const PRO_MESSAGE_LIMIT = 100;

  // ✨ NOUVEAU: Initialiser le mode sombre depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (!savedTheme) {
      // Détecter la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // ✨ NOUVEAU: Toggle du mode sombre
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

  // ✨ NOUVEAU: Export PDF
  const handleExportPDF = () => {
    if (subscriptionTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }

    const title = messages.length > 1 
      ? messages[1].content.substring(0, 60) 
      : 'محادثة جديدة';

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

  const handleLemonSqueezyCheckout = () => {
    const email = user?.email || '';
    const checkoutUrl = `https://yafaqih.lemonsqueezy.com/buy/669f5834-1817-42d3-ab4a-a8441db40737?checkout[email]=${encodeURIComponent(email)}`;
    window.open(checkoutUrl, '_blank');
  };

  const handleProCheckout = () => {
    const email = user?.email || '';
    const checkoutUrl = `https://yafaqih.lemonsqueezy.com/buy/c1fd514d-562d-45b0-8dff-c5f1ab34743f?checkout[email]=${encodeURIComponent(email)}`;
    window.open(checkoutUrl, '_blank');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageLimit = subscriptionTier === 'free' ? FREE_MESSAGE_LIMIT : 
                        subscriptionTier === 'pro' ? PRO_MESSAGE_LIMIT : Infinity;

    if (messageCount >= messageLimit) {
      setShowPremiumModal(true);
      return;
    }

    const userMessage = { id: nextId, role: 'user', content: input, isFavorite: false, references: [] };
    setMessages(prev => [...prev, userMessage]);
    setNextId(nextId + 1);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          subscriptionTier,
          userId: user?.id
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
      setNextId(nextId + 2);

      if (data.conversationId) {
        loadConversations();
      }
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: nextId + 1,
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        isFavorite: false,
        references: []
      }]);
      setNextId(nextId + 2);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isFavorite: !msg.isFavorite } : msg
    ));
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/conversations/list?userId=${user.id}`);
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
        const loadedMessages = data.conversation.messages.map((msg, index) => ({
          id: index + 1000,
          role: msg.role,
          content: msg.content,
          references: msg.references ? JSON.parse(msg.references) : [],
          isFavorite: false
        }));
        setMessages([messages[0], ...loadedMessages]);
        setCurrentConversationId(conversationId);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!confirm('هل تريد حذف هذه المحادثة؟')) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const favoriteMessages = messages.filter(msg => msg.isFavorite);

  const getAuthenticityLevel = (referenceText) => {
    const text = referenceText.toLowerCase();
    
    if (text.includes('صحيح البخاري') || text.includes('صحيح مسلم')) {
      return {
        label: 'صحيح',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        icon: <Shield className="w-3 h-3" />
      };
    }
    
    if (text.includes('حديث صحيح') || text.includes('إسناده صحيح')) {
      return {
        label: 'صحيح',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        icon: <Shield className="w-3 h-3" />
      };
    }
    
    if (text.includes('حديث حسن') || text.includes('إسناده حسن') || 
        text.includes('سنن الترمذي') || text.includes('سنن أبي داود') || 
        text.includes('سنن النسائي') || text.includes('سنن ابن ماجه')) {
      return {
        label: 'حسن',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        icon: <Check className="w-3 h-3" />
      };
    }
    
    if (text.includes('حديث ضعيف') || text.includes('إسناده ضعيف')) {
      return {
        label: 'ضعيف',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        icon: <AlertCircle className="w-3 h-3" />
      };
    }
    
    if (text.includes('موضوع') || text.includes('مكذوب')) {
      return {
        label: 'موضوع',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        icon: <X className="w-3 h-3" />
      };
    }
    
    if (text.includes('القرآن') || text.includes('قرآن') || 
        text.includes('تفسير') || text.includes('آية')) {
      return {
        label: 'قرآن كريم',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: <BookOpen className="w-3 h-3" />
      };
    }
    
    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">المساعد الإسلامي</h1>
            <p className="text-gray-600 dark:text-gray-300">خطب، قرآن وأحاديث - السنة النبوية</p>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            المتابعة مع Google
          </button>

          {/* ✨ NOUVEAU: Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                أو
              </span>
            </div>
          </div>

          {/* ✨ NOUVEAU: Lien vers authentification email/password */}
          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            تسجيل الدخول بالبريد الإلكتروني
          </button>


          {/* Toggle mode sombre */}
          <button
            onClick={toggleDarkMode}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200" dir="rtl">
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full p-8 shadow-2xl transform animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 flex-row-reverse">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-2xl">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-right">
              اختر خطتك المناسبة
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-right">
              {subscriptionTier === 'free' && `لقد وصلت إلى حد ${FREE_MESSAGE_LIMIT} رسائل مجانية`}
              {subscriptionTier === 'pro' && `لقد وصلت إلى حد ${PRO_MESSAGE_LIMIT} رسائل للخطة الاحترافية`}
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800/50">
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 text-right">مجاني</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-right">0 درهم</div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{FREE_MESSAGE_LIMIT} رسائل/جلسة</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">إجابات أساسية</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">مراجع محدودة</span>
                  </li>
                </ul>
              </div>

              <div className="border-2 border-blue-500 rounded-2xl p-6 relative bg-white dark:bg-gray-800/50">
                <div className="absolute top-0 left-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg rounded-tl-lg">
                  جديد
                </div>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 text-right">احترافي</div>
                <div className="flex items-baseline gap-2 mb-4 flex-row-reverse justify-end">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">15 درهم</span>
                  <span className="text-gray-500 dark:text-gray-400">/شهر</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{PRO_MESSAGE_LIMIT} رسالة/شهر</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">تفسير القرآن</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">شرح الأحاديث</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">مراجع موثقة</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">أسئلة فقهية</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <X className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">إعداد الخطب</span>
                  </li>
                </ul>
                <button
                  onClick={handleProCheckout}
                  className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition-all"
                >
                  اشترك الآن
                </button>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-yellow-400 text-emerald-900 px-3 py-1 text-xs font-bold rounded-br-lg rounded-tl-lg">
                  الأكثر شعبية
                </div>
                <div className="text-sm font-semibold mb-2 text-emerald-100 text-right">مميز</div>
                <div className="flex items-baseline gap-2 mb-4 flex-row-reverse justify-end">
                  <span className="text-3xl font-bold">25 درهم</span>
                  <span className="text-emerald-100">/شهر</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">رسائل غير محدودة</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">كل ميزات الخطة الاحترافية</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Crown className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">إعداد الخطب</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">إجابات مفصلة</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">تصدير PDF</span>
                  </li>
                  <li className="flex items-start gap-2 flex-row-reverse text-right">
                    <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">دعم ذو أولوية</span>
                  </li>
                </ul>
                <button
                  onClick={handleLemonSqueezyCheckout}
                  className="w-full bg-yellow-400 text-gray-900 font-bold py-2.5 rounded-xl hover:bg-yellow-500 transition-all"
                >
                  اشترك الآن
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              دفع آمن عبر Lemon Squeezy • إلغاء متى تشاء
            </p>
          </div>
        </div>
      )}

      {/* ✨ Header responsive avec menu mobile */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Header principal */}
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold truncate">المساعد الإسلامي</h1>
                <p className="text-xs sm:text-sm text-emerald-100 dark:text-gray-400 truncate">
                  {subscriptionTier === 'premium' && '⭐ مميز'}
                  {subscriptionTier === 'pro' && '💎 احترافي'}
                  {subscriptionTier === 'free' && `${messageCount}/${FREE_MESSAGE_LIMIT}`}
                </p>
              </div>
            </div>

            {/* Actions desktop et bouton menu mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Actions visibles uniquement sur desktop */}
              <div className="hidden md:flex items-center gap-2">
                {/* Bouton Notifications Prière */}
                <PrayerButton />

                <button
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleExportPDF}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="تصدير المحادثة PDF"
                  disabled={messages.length <= 1 || subscriptionTier !== 'premium'}
                >
                  <Download className="w-5 h-5" />
                </button>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="لوحة التحكم"
                >
                  <User className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="المحادثات السابقة"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="المفضلة"
                >
                  <Star className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAbout(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  حول التطبيق
                </button>
                

                {subscriptionTier === 'free' && (
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    ترقية
                  </button>
                )}

                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Boutons essentiels mobile */}
              <PrayerButton />
              
              <button
                onClick={toggleDarkMode}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Bouton menu hamburger (mobile uniquement) */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="القائمة"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Menu mobile déroulant */}
          {showMobileMenu && (
            <div className="md:hidden mt-3 pt-3 border-t border-white/20 space-y-2">
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-right"
              >
                <MessageSquare className="w-5 h-5" />
                <span>المحادثات السابقة</span>
              </button>

              <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-right"
              >
                <Star className="w-5 h-5" />
                <span>المفضلة</span>
              </button>

              <button
                onClick={() => {
                  setShowAbout(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-right"
              >
                <BookOpen className="w-5 h-5" />
                <span>حول التطبيق</span>
              </button>


              <button
                onClick={() => {
                  handleExportPDF();
                  setShowMobileMenu(false);
                }}
                disabled={messages.length <= 1 || subscriptionTier !== 'premium'}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-right disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>تصدير PDF</span>
                {subscriptionTier !== 'premium' && <span className="text-xs">(مميز)</span>}
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-right"
              >
                <User className="w-5 h-5" />
                <span>لوحة التحكم</span>
              </button>

              {subscriptionTier === 'free' && (
                <button
                  onClick={() => {
                    setShowPremiumModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-yellow-400 text-gray-900 px-3 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2 justify-center"
                >
                  <Crown className="w-4 h-4" />
                  <span>ترقية الحساب</span>
                </button>
              )}

              <button
                onClick={() => {
                  signOut();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/20 rounded-lg transition-colors text-right text-red-200"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historique avec mode sombre */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-40 overflow-y-auto transition-colors duration-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">المحادثات المحفوظة</h2>
            </div>
            
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد محادثات محفوظة</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  ستُحفظ محادثاتك تلقائياً
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <button
                        onClick={() => deleteConversation(conv.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* ✨ NOUVEAU: Bouton Export PDF dans l'historique */}
                      {subscriptionTier === 'premium' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportHistoricalPDF(conv.id);
                          }}
                          className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="تصدير PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      <div onClick={() => loadConversation(conv.id)} className="flex-1 text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                          {conv.title || 'محادثة جديدة'}
                        </p>
                        <div className="flex items-center gap-2 justify-end text-xs">
                          {conv.messageCount && (
                            <>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {conv.messageCount} رسائل
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">•</span>
                            </>
                          )}
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString('ar-SA', {
                              day: 'numeric',
                              month: 'short',
                              year: conv.createdAt && new Date(conv.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}
                          </span>
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

      {/* Modal Favoris avec mode sombre */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 flex-row-reverse">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المفضلة</h2>
              <button
                onClick={() => setShowFavorites(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
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
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {msg.role === 'user' ? 'أنت' : 'المساعد'}
                      </span>
                      <button
                        onClick={() => toggleFavorite(msg.id)}
                        className="text-yellow-500"
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 text-right whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages avec mode sombre */}
      <div className="max-w-4xl mx-auto p-4 pb-32">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}>
                {msg.role === 'user' ? (
                  <span className="text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                ) : (
                  <BookOpen className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="flex-1 max-w-3xl">
                <div className={`rounded-2xl p-6 ${
                  msg.role === 'user' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
                }`}>
                  <div className="flex justify-between items-start mb-2 flex-row-reverse">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {msg.role === 'user' ? 'أنت' : 'المساعد الإسلامي'}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* ✨ NOUVEAU: Bouton TTS pour les messages de l'assistant */}
                      {msg.role === 'assistant' && (
                        <ArabicTTS text={msg.content} />
                      )}
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => toggleFavorite(msg.id)}
                          className="text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition-colors"
                        >
                          <Star className={`w-5 h-5 ${msg.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-800 dark:text-gray-200 text-right whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>

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
                                    {authenticity.icon}
                                    {authenticity.label}
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

        {/* Suggestions avec mode sombre - Layout optimisé */}
        {messages.length === 1 && (
          <div className="mt-8 flex flex-col items-end gap-3 max-w-2xl ml-auto">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestion(suggestion)}
                className="w-full sm:w-3/4 md:w-2/3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
              >
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 text-right">
                    {suggestion}
                  </span>
                  <Sparkles className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input responsive avec mode sombre */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
            <div className="flex gap-2 sm:gap-3 items-end">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {/* ✨ NOUVEAU: Bouton de reconnaissance vocale */}
              <VoiceRecognition
                onTranscript={(text) => setInput(text)}
                language="ar-SA"
              />
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="اكتب سؤالك هنا... أو استخدم الميكروفون 🎤"
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-right text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent resize-none min-h-[40px] sm:min-h-[48px] max-h-32"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: window.innerWidth < 640 ? '40px' : '48px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center hidden sm:block">
              اضغط Enter للإرسال • Shift+Enter لسطر جديد • 🎤 للتسجيل الصوتي
            </p>
          </div>
        </div>
      </div>

      {/* ✨ Boussole Qibla (bouton flottant en bas) */}
      {isAuthenticated && <QiblaCompass />}
{/* Modal À propos */}
      {showAbout && (
        <AboutPage onClose={() => setShowAbout(false)} />
      )}
      {/* ✨ DÉSACTIVÉ: Notifications Prière (déplacées dans header)
      {isAuthenticated && <PrayerNotifications />}
      */}
    </div>
  );
  
}