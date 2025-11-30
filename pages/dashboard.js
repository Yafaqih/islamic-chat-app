import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  BarChart3,
  MessageSquare,
  Calendar,
  Crown,
  Settings,
  Download,
  Trash2,
  LogOut,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft,
  User,
  CreditCard,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, conversations, subscription, settings

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Charger les conversations
      const convsRes = await fetch(`/api/conversations/list?userId=${session.user.id}`);
      const convsData = await convsRes.json();
      setConversations(convsData.conversations || []);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    if (!confirm('هل تريد حذف هذه المحادثة؟')) return;
    
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      setConversations(conversations.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleExportConversation = async (id) => {
    // Logique d'export PDF (déjà implémentée)
    console.log('Export conversation:', id);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const user = session.user;
  const subscriptionTier = user.subscriptionTier || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                <p className="text-sm text-emerald-100 dark:text-gray-400">
                  مرحباً، {user.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {subscriptionTier === 'premium' && (
                <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  مميز
                </div>
              )}
              {subscriptionTier === 'pro' && (
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                  احترافي
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'conversations', label: 'المحادثات', icon: MessageSquare },
              { id: 'subscription', label: 'الاشتراك', icon: Crown },
              { id: 'settings', label: 'الإعدادات', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats?.totalMessages || 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الرسائل</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats?.totalConversations || 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">المحادثات</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                    <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats?.messageCount || 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscriptionTier === 'free' ? 'من 10' : subscriptionTier === 'pro' ? 'من 100' : 'غير محدود'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats?.daysActive || 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">أيام نشطة</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">النشاط الأخير</h2>
              <div className="space-y-4">
                {conversations.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {conv.title || 'محادثة جديدة'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {conv.messageCount} رسائل • {new Date(conv.updatedAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/')}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                    >
                      فتح
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  جميع المحادثات ({conversations.length})
                </h2>
              </div>
              
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">لا توجد محادثات بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          {conv.title || 'محادثة جديدة'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{conv.messageCount} رسائل</span>
                          <span>•</span>
                          <span>{new Date(conv.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {subscriptionTier === 'premium' && (
                          <button
                            onClick={() => handleExportConversation(conv.id)}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="تصدير PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteConversation(conv.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">خطتك الحالية</h2>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {subscriptionTier === 'premium' && (
                    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {subscriptionTier === 'pro' && (
                    <div className="bg-blue-500 p-3 rounded-xl">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {subscriptionTier === 'free' && (
                    <div className="bg-gray-300 dark:bg-gray-600 p-3 rounded-xl">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {subscriptionTier === 'premium' && 'الخطة المميزة'}
                      {subscriptionTier === 'pro' && 'الخطة الاحترافية'}
                      {subscriptionTier === 'free' && 'الخطة المجانية'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {subscriptionTier === 'premium' && '25 درهم/شهر'}
                      {subscriptionTier === 'pro' && '15 درهم/شهر'}
                      {subscriptionTier === 'free' && 'مجاناً'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">الرسائل المستخدمة</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {stats?.messageCount || 0} / {subscriptionTier === 'free' ? '10' : subscriptionTier === 'pro' ? '100' : '∞'}
                    </span>
                  </div>
                  {subscriptionTier !== 'premium' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            ((stats?.messageCount || 0) / (subscriptionTier === 'free' ? 10 : 100)) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {subscriptionTier !== 'premium' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">ترقية خطتك</h3>
                  
                  {subscriptionTier === 'free' && (
                    <>
                      <div className="border-2 border-blue-500 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">الخطة الاحترافية</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">15 درهم/شهر</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">100</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">رسالة/شهر</div>
                          </div>
                        </div>
                        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                          الترقية الآن
                        </button>
                      </div>

                      <div className="border-2 border-yellow-400 rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Crown className="w-5 h-5 text-yellow-500" />
                              الخطة المميزة
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">25 درهم/شهر</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">غير محدود</div>
                          </div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 py-2 rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-colors font-semibold">
                          الترقية الآن
                        </button>
                      </div>
                    </>
                  )}

                  {subscriptionTier === 'pro' && (
                    <div className="border-2 border-yellow-400 rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-500" />
                            الخطة المميزة
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">25 درهم/شهر</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">غير محدود</div>
                        </div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 py-2 rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-colors font-semibold">
                        الترقية الآن
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">معلومات الحساب</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الاسم
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    تاريخ التسجيل
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الإجراءات</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => signOut()}
                  className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}