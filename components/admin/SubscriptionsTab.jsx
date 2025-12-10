// components/admin/SubscriptionsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  CreditCard, Users, DollarSign, TrendingUp, Calendar,
  RefreshCw, Search, Filter, Download, Edit2, Trash2,
  CheckCircle, XCircle, Clock, Zap, Crown, User,
  ChevronLeft, ChevronRight, MoreVertical, Eye, AlertCircle,
  Save, X, Plus
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * SubscriptionsTab - Gestion des abonnements avec vraies données
 */
export default function SubscriptionsTab() {
  const { language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showSuccess, setShowSuccess] = useState('');

  const txt = {
    ar: {
      title: 'إدارة الاشتراكات',
      overview: 'نظرة عامة',
      plans: 'الخطط',
      history: 'المشتركون',
      totalSubscribers: 'إجمالي المستخدمين',
      activeSubscriptions: 'الاشتراكات المدفوعة',
      monthlyRevenue: 'الإيرادات الشهرية',
      yearlyRevenue: 'الإيرادات السنوية',
      planName: 'اسم الخطة',
      price: 'السعر',
      messageLimit: 'حد الرسائل',
      features: 'المميزات',
      subscribers: 'المشتركون',
      status: 'الحالة',
      actions: 'إجراءات',
      active: 'نشط',
      inactive: 'غير نشط',
      cancelled: 'ملغي',
      expired: 'منتهي',
      trial: 'تجريبي',
      free: 'مجاني',
      pro: 'احترافي',
      premium: 'مميز',
      edit: 'تعديل',
      save: 'حفظ',
      cancel: 'إلغاء',
      close: 'إغلاق',
      user: 'المستخدم',
      plan: 'الخطة',
      amount: 'المبلغ',
      date: 'التاريخ',
      nextBilling: 'الفاتورة التالية',
      noSubscriptions: 'لا توجد اشتراكات',
      loading: 'جاري التحميل...',
      searchPlaceholder: 'البحث بالاسم أو البريد...',
      exportData: 'تصدير',
      allPlans: 'جميع الخطط',
      allStatus: 'جميع الحالات',
      month: '/شهر',
      unlimited: 'غير محدود',
      messagesPerDay: 'رسالة/يوم',
      editPlan: 'تعديل الخطة',
      editSubscription: 'تعديل الاشتراك',
      changePlan: 'تغيير الخطة',
      saveSuccess: 'تم الحفظ بنجاح',
      currency: 'العملة',
      planColor: 'اللون',
      planActive: 'الخطة نشطة',
      addFeature: 'إضافة ميزة',
      removeFeature: 'حذف',
      featurePlaceholder: 'ميزة جديدة...',
      reason: 'السبب (اختياري)',
      upgrade: 'ترقية',
      downgrade: 'تخفيض'
    },
    fr: {
      title: 'Gestion des Abonnements',
      overview: 'Vue d\'ensemble',
      plans: 'Forfaits',
      history: 'Abonnés',
      totalSubscribers: 'Total Utilisateurs',
      activeSubscriptions: 'Abonnements Payants',
      monthlyRevenue: 'Revenu Mensuel',
      yearlyRevenue: 'Revenu Annuel',
      planName: 'Nom du forfait',
      price: 'Prix',
      messageLimit: 'Limite messages',
      features: 'Fonctionnalités',
      subscribers: 'Abonnés',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      cancelled: 'Annulé',
      expired: 'Expiré',
      trial: 'Essai',
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      close: 'Fermer',
      user: 'Utilisateur',
      plan: 'Forfait',
      amount: 'Montant',
      date: 'Date',
      nextBilling: 'Prochaine facture',
      noSubscriptions: 'Aucun abonnement',
      loading: 'Chargement...',
      searchPlaceholder: 'Rechercher par nom ou email...',
      exportData: 'Exporter',
      allPlans: 'Tous les forfaits',
      allStatus: 'Tous les statuts',
      month: '/mois',
      unlimited: 'Illimité',
      messagesPerDay: 'messages/jour',
      editPlan: 'Modifier le forfait',
      editSubscription: 'Modifier l\'abonnement',
      changePlan: 'Changer de forfait',
      saveSuccess: 'Enregistré avec succès',
      currency: 'Devise',
      planColor: 'Couleur',
      planActive: 'Forfait actif',
      addFeature: 'Ajouter une fonctionnalité',
      removeFeature: 'Supprimer',
      featurePlaceholder: 'Nouvelle fonctionnalité...',
      reason: 'Raison (optionnel)',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade'
    },
    en: {
      title: 'Subscription Management',
      overview: 'Overview',
      plans: 'Plans',
      history: 'Subscribers',
      totalSubscribers: 'Total Users',
      activeSubscriptions: 'Paid Subscriptions',
      monthlyRevenue: 'Monthly Revenue',
      yearlyRevenue: 'Yearly Revenue',
      planName: 'Plan Name',
      price: 'Price',
      messageLimit: 'Message Limit',
      features: 'Features',
      subscribers: 'Subscribers',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      cancelled: 'Cancelled',
      expired: 'Expired',
      trial: 'Trial',
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      user: 'User',
      plan: 'Plan',
      amount: 'Amount',
      date: 'Date',
      nextBilling: 'Next Billing',
      noSubscriptions: 'No subscriptions',
      loading: 'Loading...',
      searchPlaceholder: 'Search by name or email...',
      exportData: 'Export',
      allPlans: 'All Plans',
      allStatus: 'All Status',
      month: '/month',
      unlimited: 'Unlimited',
      messagesPerDay: 'messages/day',
      editPlan: 'Edit Plan',
      editSubscription: 'Edit Subscription',
      changePlan: 'Change Plan',
      saveSuccess: 'Saved successfully',
      currency: 'Currency',
      planColor: 'Color',
      planActive: 'Plan Active',
      addFeature: 'Add Feature',
      removeFeature: 'Remove',
      featurePlaceholder: 'New feature...',
      reason: 'Reason (optional)',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade'
    }
  }[language] || {};

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Recharger l'historique quand les filtres changent
  useEffect(() => {
    if (activeView === 'history') {
      loadHistory();
    }
  }, [page, filterStatus, filterTier, search, activeView]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadPlans(), loadHistory()]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Erreur plans:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: filterStatus,
        tier: filterTier,
        search: search
      });

      const res = await fetch(`/api/admin/subscriptions/history?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Erreur historique:', error);
    }
  };

  // Sauvegarder les modifications d'un plan
  const savePlan = async () => {
    if (!editingPlan) return;
    
    setSaving(true);
    try {
      // Mettre à jour le plan dans la liste
      const updatedPlans = plans.map(p => 
        p.id === editingPlan.id ? editingPlan : p
      );

      const res = await fetch('/api/admin/subscriptions/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: updatedPlans })
      });

      if (res.ok) {
        setPlans(updatedPlans);
        setEditingPlan(null);
        showSuccessMessage(txt.saveSuccess);
        await loadStats(); // Recharger les stats pour mettre à jour les revenus
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde plan:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Modifier l'abonnement d'un utilisateur
  const saveSubscription = async () => {
    if (!editingSubscription) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${editingSubscription.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionTier: editingSubscription.plan,
          subscriptionStatus: editingSubscription.status,
          reason: editingSubscription.reason
        })
      });

      if (res.ok) {
        setEditingSubscription(null);
        showSuccessMessage(txt.saveSuccess);
        await Promise.all([loadStats(), loadHistory()]);
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification abonnement:', error);
      alert('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const showSuccessMessage = (message) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const exportData = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions/history?limit=1000&tier=all');
      if (res.ok) {
        const data = await res.json();
        const csv = [
          ['Nom', 'Email', 'Forfait', 'Statut', 'Montant', 'Date'].join(','),
          ...data.subscriptions.map(s => [
            s.user.name,
            s.user.email,
            s.plan,
            s.status,
            s.amount,
            new Date(s.startDate).toLocaleDateString()
          ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

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
        
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{showSuccess}</span>
            </div>
          )}
          
          {/* Sub-navigation */}
          <div className={`flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {['overview', 'plans', 'history'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === view
                    ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                {txt[view]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview */}
      {activeView === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={txt.totalSubscribers}
              value={stats.totalSubscribers?.toLocaleString() || '0'}
              icon={Users}
              color="blue"
              isRTL={isRTL}
            />
            <StatCard
              title={txt.activeSubscriptions}
              value={stats.activeSubscriptions?.toLocaleString() || '0'}
              icon={CheckCircle}
              color="green"
              isRTL={isRTL}
            />
            <StatCard
              title={txt.monthlyRevenue}
              value={`$${stats.monthlyRevenue?.toLocaleString() || '0'}`}
              icon={DollarSign}
              color="emerald"
              trend={stats.growth}
              isRTL={isRTL}
            />
            <StatCard
              title={txt.yearlyRevenue}
              value={`$${stats.yearlyRevenue?.toLocaleString() || '0'}`}
              icon={TrendingUp}
              color="purple"
              isRTL={isRTL}
            />
          </div>

          {/* Distribution par plan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const count = stats.byPlan?.[plan.id] || 0;
              const percentage = stats.totalSubscribers > 0 
                ? ((count / stats.totalSubscribers) * 100).toFixed(1) 
                : 0;
              
              return (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.id === 'free' ? 'bg-gray-100 dark:bg-gray-700' :
                      plan.id === 'pro' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {plan.id === 'free' ? <User className="w-6 h-6 text-gray-600" /> :
                       plan.id === 'pro' ? <Zap className="w-6 h-6 text-blue-600" /> :
                       <Crown className="w-6 h-6 text-purple-600" />}
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {language === 'ar' ? plan.nameAr : language === 'fr' ? plan.nameFr : plan.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {plan.price > 0 ? `$${plan.price}${txt.month}` : txt.free}
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
                        className={`h-2 rounded-full transition-all ${
                          plan.id === 'free' ? 'bg-gray-500' :
                          plan.id === 'pro' ? 'bg-blue-500' :
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

      {/* Plans Management */}
      {activeView === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 transition-all relative ${
                plan.id === 'premium' 
                  ? 'border-purple-500' 
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
                  plan.id === 'free' ? 'bg-gray-100 dark:bg-gray-700' :
                  plan.id === 'pro' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  {plan.id === 'free' ? <User className="w-8 h-8 text-gray-600" /> :
                   plan.id === 'pro' ? <Zap className="w-8 h-8 text-blue-600" /> :
                   <Crown className="w-8 h-8 text-purple-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {language === 'ar' ? plan.nameAr : language === 'fr' ? plan.nameFr : plan.name}
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">{txt.month}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {plan.messageLimit === -1 ? txt.unlimited : `${plan.messageLimit} ${txt.messagesPerDay}`}
                </p>
                <p className="text-sm text-emerald-600 font-medium mt-1">
                  {plan.subscriberCount || 0} {txt.subscribers}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {(language === 'ar' ? plan.featuresAr : language === 'fr' ? plan.featuresFr : plan.features)?.map((feature, idx) => (
                  <li key={idx} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setEditingPlan({...plan})}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {txt.edit}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Subscribers List */}
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
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200`}
              />
            </div>
            
            <select
              value={filterTier}
              onChange={(e) => { setFilterTier(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">{txt.allPlans}</option>
              <option value="free">{txt.free}</option>
              <option value="pro">{txt.pro}</option>
              <option value="premium">{txt.premium}</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">{txt.allStatus}</option>
              <option value="active">{txt.active}</option>
              <option value="cancelled">{txt.cancelled}</option>
              <option value="expired">{txt.expired}</option>
            </select>
            
            <button 
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
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
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {txt.noSubscriptions}
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {sub.user.image ? (
                              <img src={sub.user.image} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600 font-medium text-sm">
                                  {sub.user.name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{sub.user.name}</p>
                              <p className="text-sm text-gray-500">{sub.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {getPlanBadge(sub.plan)}
                        </td>
                        <td className={`px-6 py-4 font-medium text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                          ${sub.amount}{txt.month}
                        </td>
                        <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className={`px-6 py-4 text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {new Date(sub.startDate).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <button 
                            onClick={() => setEditingSubscription({...sub})}
                            className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title={txt.edit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Edit Plan */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{txt.editPlan}</h3>
              <button onClick={() => setEditingPlan(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {txt.planName}
                </label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}
                />
              </div>

              {/* Prix */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {txt.price} (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value) || 0})}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}
                />
              </div>

              {/* Limite messages */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {txt.messageLimit} (-1 = {txt.unlimited})
                </label>
                <input
                  type="number"
                  value={editingPlan.messageLimit}
                  onChange={(e) => setEditingPlan({...editingPlan, messageLimit: parseInt(e.target.value) || 0})}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}
                />
              </div>

              {/* Features */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {txt.features}
                </label>
                <div className="space-y-2">
                  {editingPlan.features?.map((feature, idx) => (
                    <div key={idx} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editingPlan.features];
                          newFeatures[idx] = e.target.value;
                          setEditingPlan({...editingPlan, features: newFeatures});
                        }}
                        className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm ${isRTL ? 'text-right' : ''}`}
                      />
                      <button
                        onClick={() => {
                          const newFeatures = editingPlan.features.filter((_, i) => i !== idx);
                          setEditingPlan({...editingPlan, features: newFeatures});
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditingPlan({...editingPlan, features: [...(editingPlan.features || []), '']})}
                    className={`flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Plus className="w-4 h-4" />
                    {txt.addFeature}
                  </button>
                </div>
              </div>

              {/* Active toggle */}
              <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700 dark:text-gray-300">{txt.planActive}</span>
                <button
                  onClick={() => setEditingPlan({...editingPlan, isActive: !editingPlan.isActive})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editingPlan.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      editingPlan.isActive ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className={`flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {txt.cancel}
              </button>
              <button
                onClick={savePlan}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {txt.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Subscription */}
      {editingSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{txt.editSubscription}</h3>
              <button onClick={() => setEditingSubscription(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* User info */}
              <div className={`flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-lg">
                    {editingSubscription.user.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{editingSubscription.user.name}</p>
                  <p className="text-sm text-gray-500">{editingSubscription.user.email}</p>
                </div>
              </div>

              {/* Change Plan */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {txt.changePlan}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['free', 'pro', 'premium'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setEditingSubscription({...editingSubscription, plan: tier})}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        editingSubscription.plan === tier
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        {tier === 'free' ? <User className="w-5 h-5 mx-auto text-gray-500" /> :
                         tier === 'pro' ? <Zap className="w-5 h-5 mx-auto text-blue-500" /> :
                         <Crown className="w-5 h-5 mx-auto text-purple-500" />}
                        <p className="text-sm font-medium mt-1 text-gray-700 dark:text-gray-300">{txt[tier]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {txt.status}
                </label>
                <select
                  value={editingSubscription.status}
                  onChange={(e) => setEditingSubscription({...editingSubscription, status: e.target.value})}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}
                >
                  <option value="active">{txt.active}</option>
                  <option value="cancelled">{txt.cancelled}</option>
                  <option value="expired">{txt.expired}</option>
                  <option value="trial">{txt.trial}</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {txt.reason}
                </label>
                <input
                  type="text"
                  value={editingSubscription.reason || ''}
                  onChange={(e) => setEditingSubscription({...editingSubscription, reason: e.target.value})}
                  placeholder="Ex: Upgrade gratuit, cadeau..."
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}
                />
              </div>
            </div>

            <div className={`flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setEditingSubscription(null)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {txt.cancel}
              </button>
              <button
                onClick={saveSubscription}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {txt.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, icon: Icon, color, trend, isRTL }) {
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
          {trend !== undefined && (
            <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
