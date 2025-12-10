// components/admin/SubscriptionsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  CreditCard, Users, DollarSign, TrendingUp, Calendar,
  RefreshCw, Search, Filter, Download, Edit2, Trash2,
  CheckCircle, XCircle, Clock, Zap, Crown, User,
  ChevronLeft, ChevronRight, MoreVertical, Eye, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * SubscriptionsTab - Gestion des abonnements
 */
export default function SubscriptionsTab() {
  const { language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, plans, history
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editingPlan, setEditingPlan] = useState(null);

  const txt = {
    ar: {
      title: 'إدارة الاشتراكات',
      overview: 'نظرة عامة',
      plans: 'الخطط',
      history: 'السجل',
      
      // Stats
      totalSubscribers: 'إجمالي المشتركين',
      activeSubscriptions: 'الاشتراكات النشطة',
      monthlyRevenue: 'الإيرادات الشهرية',
      yearlyRevenue: 'الإيرادات السنوية',
      
      // Plans
      planName: 'اسم الخطة',
      price: 'السعر',
      features: 'المميزات',
      subscribers: 'المشتركون',
      status: 'الحالة',
      actions: 'إجراءات',
      
      // Status
      active: 'نشط',
      inactive: 'غير نشط',
      cancelled: 'ملغي',
      expired: 'منتهي',
      trial: 'تجريبي',
      
      // Plans
      free: 'مجاني',
      pro: 'احترافي',
      premium: 'مميز',
      
      // Features
      messagesPerDay: 'رسالة/يوم',
      unlimitedMessages: 'رسائل غير محدودة',
      basicSupport: 'دعم أساسي',
      prioritySupport: 'دعم أولوية',
      premiumSupport: 'دعم مميز 24/7',
      quranAccess: 'الوصول للقرآن',
      advancedFeatures: 'مميزات متقدمة',
      allFeatures: 'جميع المميزات',
      
      // Actions
      edit: 'تعديل',
      delete: 'حذف',
      view: 'عرض',
      save: 'حفظ',
      cancel: 'إلغاء',
      
      // History
      user: 'المستخدم',
      plan: 'الخطة',
      amount: 'المبلغ',
      date: 'التاريخ',
      paymentMethod: 'طريقة الدفع',
      
      // Messages
      noSubscriptions: 'لا توجد اشتراكات',
      loading: 'جاري التحميل...',
      searchPlaceholder: 'البحث...',
      exportData: 'تصدير البيانات',
      
      month: '/شهر',
      year: '/سنة'
    },
    fr: {
      title: 'Gestion des Abonnements',
      overview: 'Vue d\'ensemble',
      plans: 'Plans',
      history: 'Historique',
      
      // Stats
      totalSubscribers: 'Total Abonnés',
      activeSubscriptions: 'Abonnements Actifs',
      monthlyRevenue: 'Revenu Mensuel',
      yearlyRevenue: 'Revenu Annuel',
      
      // Plans
      planName: 'Nom du plan',
      price: 'Prix',
      features: 'Fonctionnalités',
      subscribers: 'Abonnés',
      status: 'Statut',
      actions: 'Actions',
      
      // Status
      active: 'Actif',
      inactive: 'Inactif',
      cancelled: 'Annulé',
      expired: 'Expiré',
      trial: 'Essai',
      
      // Plans
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      
      // Features
      messagesPerDay: 'messages/jour',
      unlimitedMessages: 'Messages illimités',
      basicSupport: 'Support basique',
      prioritySupport: 'Support prioritaire',
      premiumSupport: 'Support premium 24/7',
      quranAccess: 'Accès Coran',
      advancedFeatures: 'Fonctionnalités avancées',
      allFeatures: 'Toutes les fonctionnalités',
      
      // Actions
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      save: 'Enregistrer',
      cancel: 'Annuler',
      
      // History
      user: 'Utilisateur',
      plan: 'Plan',
      amount: 'Montant',
      date: 'Date',
      paymentMethod: 'Méthode de paiement',
      
      // Messages
      noSubscriptions: 'Aucun abonnement',
      loading: 'Chargement...',
      searchPlaceholder: 'Rechercher...',
      exportData: 'Exporter les données',
      
      month: '/mois',
      year: '/an'
    },
    en: {
      title: 'Subscription Management',
      overview: 'Overview',
      plans: 'Plans',
      history: 'History',
      
      // Stats
      totalSubscribers: 'Total Subscribers',
      activeSubscriptions: 'Active Subscriptions',
      monthlyRevenue: 'Monthly Revenue',
      yearlyRevenue: 'Yearly Revenue',
      
      // Plans
      planName: 'Plan Name',
      price: 'Price',
      features: 'Features',
      subscribers: 'Subscribers',
      status: 'Status',
      actions: 'Actions',
      
      // Status
      active: 'Active',
      inactive: 'Inactive',
      cancelled: 'Cancelled',
      expired: 'Expired',
      trial: 'Trial',
      
      // Plans
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      
      // Features
      messagesPerDay: 'messages/day',
      unlimitedMessages: 'Unlimited messages',
      basicSupport: 'Basic support',
      prioritySupport: 'Priority support',
      premiumSupport: 'Premium 24/7 support',
      quranAccess: 'Quran access',
      advancedFeatures: 'Advanced features',
      allFeatures: 'All features',
      
      // Actions
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      save: 'Save',
      cancel: 'Cancel',
      
      // History
      user: 'User',
      plan: 'Plan',
      amount: 'Amount',
      date: 'Date',
      paymentMethod: 'Payment Method',
      
      // Messages
      noSubscriptions: 'No subscriptions',
      loading: 'Loading...',
      searchPlaceholder: 'Search...',
      exportData: 'Export Data',
      
      month: '/month',
      year: '/year'
    }
  }[language] || {
    title: 'Subscriptions', overview: 'Overview', plans: 'Plans', history: 'History',
    totalSubscribers: 'Subscribers', activeSubscriptions: 'Active', monthlyRevenue: 'MRR',
    yearlyRevenue: 'ARR', planName: 'Plan', price: 'Price', features: 'Features',
    subscribers: 'Subscribers', status: 'Status', actions: 'Actions', active: 'Active',
    inactive: 'Inactive', cancelled: 'Cancelled', expired: 'Expired', trial: 'Trial',
    free: 'Free', pro: 'Pro', premium: 'Premium', edit: 'Edit', delete: 'Delete',
    view: 'View', save: 'Save', cancel: 'Cancel', user: 'User', plan: 'Plan',
    amount: 'Amount', date: 'Date', paymentMethod: 'Payment', noSubscriptions: 'None',
    loading: 'Loading...', searchPlaceholder: 'Search...', exportData: 'Export',
    month: '/mo', year: '/yr', messagesPerDay: 'msg/day', unlimitedMessages: 'Unlimited',
    basicSupport: 'Basic', prioritySupport: 'Priority', premiumSupport: '24/7',
    quranAccess: 'Quran', advancedFeatures: 'Advanced', allFeatures: 'All'
  };

  // Plans de base
  const [plans, setPlans] = useState([
    {
      id: 'free',
      name: txt.free,
      price: 0,
      currency: '$',
      interval: 'month',
      features: [
        `10 ${txt.messagesPerDay}`,
        txt.basicSupport,
        txt.quranAccess
      ],
      color: 'gray',
      icon: User,
      isActive: true
    },
    {
      id: 'pro',
      name: txt.pro,
      price: 9.99,
      currency: '$',
      interval: 'month',
      features: [
        `100 ${txt.messagesPerDay}`,
        txt.prioritySupport,
        txt.quranAccess,
        txt.advancedFeatures
      ],
      color: 'blue',
      icon: Zap,
      isActive: true
    },
    {
      id: 'premium',
      name: txt.premium,
      price: 29.99,
      currency: '$',
      interval: 'month',
      features: [
        txt.unlimitedMessages,
        txt.premiumSupport,
        txt.allFeatures
      ],
      color: 'purple',
      icon: Crown,
      isActive: true
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les stats
      const statsRes = await fetch('/api/admin/subscriptions/stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      } else {
        // Données de démo
        setStats({
          totalSubscribers: 1250,
          activeSubscriptions: 580,
          monthlyRevenue: 4999.50,
          yearlyRevenue: 52000,
          byPlan: { free: 650, pro: 420, premium: 180 },
          growth: 12.5
        });
      }

      // Charger l'historique
      const historyRes = await fetch('/api/admin/subscriptions/history');
      if (historyRes.ok) {
        const data = await historyRes.json();
        setSubscriptions(data.subscriptions || []);
      } else {
        // Données de démo
        setSubscriptions(generateMockHistory());
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStats({
        totalSubscribers: 1250,
        activeSubscriptions: 580,
        monthlyRevenue: 4999.50,
        yearlyRevenue: 52000,
        byPlan: { free: 650, pro: 420, premium: 180 },
        growth: 12.5
      });
      setSubscriptions(generateMockHistory());
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = () => {
    const names = ['Ahmed M.', 'Sarah L.', 'Mohammed K.', 'Fatima A.', 'Omar B.', 'Aisha C.', 'Youssef D.', 'Meryem E.'];
    const plans = ['pro', 'premium', 'pro', 'premium'];
    const statuses = ['active', 'active', 'active', 'cancelled', 'expired'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `sub_${i}`,
      user: {
        name: names[i % names.length],
        email: `user${i}@example.com`
      },
      plan: plans[i % plans.length],
      amount: plans[i % plans.length] === 'pro' ? 9.99 : 29.99,
      status: statuses[i % statuses.length],
      startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      nextBilling: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: i % 2 === 0 ? 'Stripe' : 'PayPal'
    }));
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user.name.toLowerCase().includes(search.toLowerCase()) ||
                         sub.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', icon: XCircle },
      cancelled: { color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      expired: { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
      trial: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock }
    };
    const { color, icon: Icon } = config[status] || config.inactive;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {txt[status] || status}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const config = {
      free: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', icon: User },
      pro: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', icon: Zap },
      premium: { color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', icon: Crown }
    };
    const { color, icon: Icon } = config[plan] || config.free;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {txt[plan] || plan}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.title}</h2>
        
        {/* Sub-navigation */}
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {['overview', 'plans', 'history'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === view
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {txt[view]}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {activeView === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={txt.totalSubscribers}
              value={stats.totalSubscribers?.toLocaleString()}
              icon={Users}
              color="blue"
              isRTL={isRTL}
            />
            <StatCard
              title={txt.activeSubscriptions}
              value={stats.activeSubscriptions?.toLocaleString()}
              icon={CheckCircle}
              color="green"
              isRTL={isRTL}
            />
            <StatCard
              title={txt.monthlyRevenue}
              value={`$${stats.monthlyRevenue?.toLocaleString()}`}
              icon={DollarSign}
              color="emerald"
              isRTL={isRTL}
            />
            <StatCard
              title={txt.yearlyRevenue}
              value={`$${stats.yearlyRevenue?.toLocaleString()}`}
              icon={TrendingUp}
              color="purple"
              isRTL={isRTL}
            />
          </div>

          {/* Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const count = stats.byPlan?.[plan.id] || 0;
              const percentage = stats.totalSubscribers > 0 
                ? ((count / stats.totalSubscribers) * 100).toFixed(1) 
                : 0;
              const Icon = plan.icon;
              
              return (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' :
                      plan.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        plan.color === 'gray' ? 'text-gray-600 dark:text-gray-400' :
                        plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{plan.name}</h3>
                      <p className="text-sm text-gray-500">
                        {plan.price > 0 ? `${plan.currency}${plan.price}${txt.month}` : txt.free}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`flex justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{count}</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          plan.color === 'gray' ? 'bg-gray-500' :
                          plan.color === 'blue' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plans */}
      {activeView === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 ${
                  plan.id === 'premium' 
                    ? 'border-purple-500 relative' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.id === 'premium' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAIRE
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                    plan.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' :
                    plan.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      plan.color === 'gray' ? 'text-gray-600 dark:text-gray-400' :
                      plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      {plan.currency}{plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500">{txt.month}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    {txt.edit}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      {activeView === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div className="flex-1 relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={txt.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">{txt.status}: All</option>
              <option value="active">{txt.active}</option>
              <option value="cancelled">{txt.cancelled}</option>
              <option value="expired">{txt.expired}</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
              <Download className="w-4 h-4" />
              {txt.exportData}
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className={`px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{txt.user}</th>
                    <th className={`px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{txt.plan}</th>
                    <th className={`px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{txt.amount}</th>
                    <th className={`px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{txt.status}</th>
                    <th className={`px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{txt.date}</th>
                    <th className={`px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{txt.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubscriptions.slice((page - 1) * 10, page * 10).map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{sub.user.name}</p>
                          <p className="text-sm text-gray-500">{sub.user.email}</p>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {getPlanBadge(sub.plan)}
                      </td>
                      <td className={`px-6 py-4 font-medium text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                        ${sub.amount}
                      </td>
                      <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className={`px-6 py-4 text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {new Date(sub.startDate).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredSubscriptions.length > 10 && (
            <div className={`flex items-center justify-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                {page} / {Math.ceil(filteredSubscriptions.length / 10)}
              </span>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(filteredSubscriptions.length / 10), p + 1))}
                disabled={page >= Math.ceil(filteredSubscriptions.length / 10)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, icon: Icon, color, isRTL }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
