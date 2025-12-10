import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, CreditCard, Tag, Key, TrendingUp, 
  Settings, LogOut, Search, Filter, Download, RefreshCw,
  DollarSign, UserCheck, UserX, Calendar, Clock, Activity,
  Package, Zap, Shield, AlertCircle, CheckCircle, XCircle, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

import UsersTab from './admin/UsersTab';
import PromoCodesTab from './admin/PromoCodesTab';
import AnalyticsTab from './admin/AnalyticsTab';
import SubscriptionsTab from './admin/SubscriptionsTab';
import SettingsTab from './admin/SettingsTab';

/**
 * Dashboard Admin Multilingue pour Ya Faqih
 */
export default function AdminDashboard({ user, onLogout, onClose }) {
  const { language, isRTL } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  // Traductions
  const txt = {
    ar: {
      adminConsole: 'لوحة الإدارة',
      accessDenied: 'الوصول مرفوض',
      noPermission: 'ليس لديك صلاحية للوصول إلى لوحة الإدارة',
      back: 'رجوع',
      today: 'اليوم',
      last7Days: 'آخر 7 أيام',
      last30Days: 'آخر 30 يوم',
      last90Days: 'آخر 90 يوم',
      allTime: 'كل الأوقات',
      refresh: 'تحديث',
      logout: 'تسجيل الخروج',
      close: 'إغلاق',
      overview: 'نظرة عامة',
      users: 'المستخدمون',
      subscriptions: 'الاشتراكات',
      promoCodes: 'أكواد الخصم',
      analytics: 'التحليلات',
      settings: 'الإعدادات',
      totalUsers: 'إجمالي المستخدمين',
      activeUsers: 'المستخدمون النشطون',
      totalRevenue: 'إجمالي الإيرادات',
      mrr: 'الإيرادات الشهرية',
      subscriptionDistribution: 'توزيع الاشتراكات',
      messageActivity: 'نشاط الرسائل',
      total: 'الإجمالي',
      todayLabel: 'اليوم',
      avgPerUser: 'المتوسط/مستخدم',
      free: 'مجاني',
      pro: 'احترافي',
      premium: 'مميز',
      recentActivity: 'النشاط الأخير',
      quickActions: 'إجراءات سريعة',
      exportData: 'تصدير البيانات',
      manageApiKeys: 'إدارة مفاتيح API',
      viewReports: 'عرض التقارير',
      systemSettings: 'إعدادات النظام',
      comingSoon: 'قريباً...',
      subscriptionSettings: 'إعدادات الاشتراكات',
      analyticsSettings: 'إعدادات التحليلات'
    },
    fr: {
      adminConsole: 'Console d\'administration',
      accessDenied: 'Accès Refusé',
      noPermission: 'Vous n\'avez pas les permissions pour accéder au dashboard admin.',
      back: 'Retour',
      today: 'Aujourd\'hui',
      last7Days: '7 derniers jours',
      last30Days: '30 derniers jours',
      last90Days: '90 derniers jours',
      allTime: 'Tout le temps',
      refresh: 'Rafraîchir',
      logout: 'Déconnexion',
      close: 'Fermer',
      overview: 'Vue d\'ensemble',
      users: 'Utilisateurs',
      subscriptions: 'Abonnements',
      promoCodes: 'Codes Promo',
      analytics: 'Analytique',
      settings: 'Paramètres',
      totalUsers: 'Utilisateurs Totaux',
      activeUsers: 'Utilisateurs Actifs',
      totalRevenue: 'Revenu Total',
      mrr: 'MRR (Revenu Mensuel)',
      subscriptionDistribution: 'Répartition des Abonnements',
      messageActivity: 'Activité Messages',
      total: 'Total',
      todayLabel: 'Aujourd\'hui',
      avgPerUser: 'Moyenne/utilisateur',
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      recentActivity: 'Activité Récente',
      quickActions: 'Actions Rapides',
      exportData: 'Exporter les Données',
      manageApiKeys: 'Gérer les Clés API',
      viewReports: 'Voir les Rapports',
      systemSettings: 'Paramètres Système',
      comingSoon: 'À venir...',
      subscriptionSettings: 'Paramètres Abonnements',
      analyticsSettings: 'Paramètres Analytique'
    },
    en: {
      adminConsole: 'Admin Console',
      accessDenied: 'Access Denied',
      noPermission: 'You don\'t have permission to access the admin dashboard.',
      back: 'Back',
      today: 'Today',
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      last90Days: 'Last 90 days',
      allTime: 'All time',
      refresh: 'Refresh',
      logout: 'Logout',
      close: 'Close',
      overview: 'Overview',
      users: 'Users',
      subscriptions: 'Subscriptions',
      promoCodes: 'Promo Codes',
      analytics: 'Analytics',
      settings: 'Settings',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      totalRevenue: 'Total Revenue',
      mrr: 'MRR (Monthly Revenue)',
      subscriptionDistribution: 'Subscription Distribution',
      messageActivity: 'Message Activity',
      total: 'Total',
      todayLabel: 'Today',
      avgPerUser: 'Average/user',
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      exportData: 'Export Data',
      manageApiKeys: 'Manage API Keys',
      viewReports: 'View Reports',
      systemSettings: 'System Settings',
      comingSoon: 'Coming soon...',
      subscriptionSettings: 'Subscription Settings',
      analyticsSettings: 'Analytics Settings'
    }
  }[language] || {
    adminConsole: 'Console d\'administration', accessDenied: 'Accès Refusé', noPermission: 'Vous n\'avez pas les permissions.', back: 'Retour', today: 'Aujourd\'hui', last7Days: '7 derniers jours', last30Days: '30 derniers jours', last90Days: '90 derniers jours', allTime: 'Tout le temps', refresh: 'Rafraîchir', logout: 'Déconnexion', close: 'Fermer', overview: 'Vue d\'ensemble', users: 'Utilisateurs', subscriptions: 'Abonnements', promoCodes: 'Codes Promo', analytics: 'Analytique', settings: 'Paramètres', totalUsers: 'Utilisateurs Totaux', activeUsers: 'Utilisateurs Actifs', totalRevenue: 'Revenu Total', mrr: 'MRR', subscriptionDistribution: 'Répartition des Abonnements', messageActivity: 'Activité Messages', total: 'Total', todayLabel: 'Aujourd\'hui', avgPerUser: 'Moyenne/utilisateur', free: 'Free', pro: 'Pro', premium: 'Premium', recentActivity: 'Activité Récente', quickActions: 'Actions Rapides', exportData: 'Exporter', manageApiKeys: 'Clés API', viewReports: 'Rapports', systemSettings: 'Paramètres', comingSoon: 'À venir...', subscriptionSettings: 'Abonnements', analyticsSettings: 'Analytique'
  };

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/stats?range=${dateRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérification admin - supporte isAdmin et role === 'admin'
  const isAdminUser = user?.isAdmin || user?.role === 'admin';
  
  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{txt.accessDenied}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{txt.noPermission}</p>
          <button onClick={onClose} className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
            {txt.back}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: txt.overview, icon: BarChart3 },
    { id: 'users', label: txt.users, icon: Users },
    { id: 'subscriptions', label: txt.subscriptions, icon: CreditCard },
    { id: 'promo', label: txt.promoCodes, icon: Tag },
    { id: 'analytics', label: txt.analytics, icon: TrendingUp },
    { id: 'settings', label: txt.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Ya Faqih Admin</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{txt.adminConsole}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="today">{txt.today}</option>
                <option value="7days">{txt.last7Days}</option>
                <option value="30days">{txt.last30Days}</option>
                <option value="90days">{txt.last90Days}</option>
                <option value="all">{txt.allTime}</option>
              </select>

              <button onClick={loadStats} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all" title={txt.refresh}>
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <div className={`flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">{user?.name || 'Admin'}</span>
              </div>

              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all" title={txt.close}>
                <X className="w-5 h-5" />
              </button>

              <button onClick={onLogout} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all" title={txt.logout}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className={`flex gap-1 overflow-x-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${isRTL ? 'flex-row-reverse' : ''} ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {activeTab === 'overview' && <OverviewTab stats={stats} loading={loading} txt={txt} isRTL={isRTL} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'promo' && <PromoCodesTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

// OverviewTab Component
function OverviewTab({ stats, loading, txt, isRTL }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const mockStats = stats || {
    totalUsers: 1250, activeUsers: 890, newUsers: 145, totalRevenue: 12450, mrr: 4200,
    subscriptions: { free: 650, pro: 420, premium: 180 },
    messages: { total: 45320, today: 1234 },
    conversion: 32.5
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={txt.totalUsers} value={mockStats.totalUsers.toLocaleString()} change="+12.5%" changeType="positive" icon={Users} color="blue" isRTL={isRTL} />
        <StatCard title={txt.activeUsers} value={mockStats.activeUsers.toLocaleString()} change="+8.2%" changeType="positive" icon={UserCheck} color="green" isRTL={isRTL} />
        <StatCard title={txt.totalRevenue} value={`$${mockStats.totalRevenue.toLocaleString()}`} change="+23.1%" changeType="positive" icon={DollarSign} color="purple" isRTL={isRTL} />
        <StatCard title={txt.mrr} value={`$${mockStats.mrr.toLocaleString()}`} change="+15.7%" changeType="positive" icon={TrendingUp} color="emerald" isRTL={isRTL} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.subscriptionDistribution}</h3>
          <div className="space-y-3">
            <SubscriptionBar label={txt.free} count={mockStats.subscriptions.free} total={mockStats.totalUsers} color="gray" isRTL={isRTL} />
            <SubscriptionBar label={txt.pro} count={mockStats.subscriptions.pro} total={mockStats.totalUsers} color="blue" isRTL={isRTL} />
            <SubscriptionBar label={txt.premium} count={mockStats.subscriptions.premium} total={mockStats.totalUsers} color="purple" isRTL={isRTL} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.messageActivity}</h3>
          <div className="space-y-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-600 dark:text-gray-400">{txt.total}</span>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{mockStats.messages.total.toLocaleString()}</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-600 dark:text-gray-400">{txt.todayLabel}</span>
              <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{mockStats.messages.today.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600 dark:text-gray-400">{txt.avgPerUser}</span>
                <span className="text-lg font-medium text-gray-800 dark:text-gray-200">{(mockStats.messages.total / mockStats.totalUsers).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, change, changeType, icon: Icon, color, isRTL }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600', green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600', emerald: 'from-emerald-500 to-emerald-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
          {change && (
            <span className={`text-sm ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// SubscriptionBar Component
function SubscriptionBar({ label, count, total, color, isRTL }) {
  const percentage = ((count / total) * 100).toFixed(1);
  const colorClasses = { gray: 'bg-gray-500', blue: 'bg-blue-500', purple: 'bg-purple-500' };

  return (
    <div>
      <div className={`flex justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{count} ({percentage}%)</span>
      </div>
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${isRTL ? 'rotate-180' : ''}`}>
        <div className={`${colorClasses[color]} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
