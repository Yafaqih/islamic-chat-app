// components/admin/AnalyticsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, MessageSquare, DollarSign,
  Calendar, RefreshCw, Download, Filter, BarChart3, PieChart,
  Activity, UserPlus, UserCheck, Zap, Crown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * AnalyticsTab - Tableau de bord analytique complet
 * Graphiques, métriques, tendances
 */
export default function AnalyticsTab() {
  const { language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');
  const [analytics, setAnalytics] = useState(null);
  const [chartType, setChartType] = useState('users');

  const txt = {
    ar: {
      title: 'التحليلات',
      period: 'الفترة',
      today: 'اليوم',
      last7Days: 'آخر 7 أيام',
      last30Days: 'آخر 30 يوم',
      last90Days: 'آخر 90 يوم',
      allTime: 'كل الأوقات',
      refresh: 'تحديث',
      export: 'تصدير',
      
      // Métriques
      totalUsers: 'إجمالي المستخدمين',
      newUsers: 'مستخدمون جدد',
      activeUsers: 'مستخدمون نشطون',
      totalMessages: 'إجمالي الرسائل',
      avgMessagesPerUser: 'متوسط الرسائل/مستخدم',
      totalRevenue: 'إجمالي الإيرادات',
      mrr: 'الإيرادات الشهرية',
      conversionRate: 'معدل التحويل',
      churnRate: 'معدل المغادرة',
      
      // Graphiques
      usersOverTime: 'المستخدمون عبر الوقت',
      messagesOverTime: 'الرسائل عبر الوقت',
      revenueOverTime: 'الإيرادات عبر الوقت',
      subscriptionDistribution: 'توزيع الاشتراكات',
      userActivity: 'نشاط المستخدمين',
      topUsers: 'أكثر المستخدمين نشاطاً',
      
      // Labels
      users: 'المستخدمون',
      messages: 'الرسائل',
      revenue: 'الإيرادات',
      free: 'مجاني',
      pro: 'احترافي',
      premium: 'مميز',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      
      // Tendances
      vsLastPeriod: 'مقارنة بالفترة السابقة',
      growth: 'نمو',
      decline: 'انخفاض',
      noChange: 'لا تغيير',
      
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات'
    },
    fr: {
      title: 'Analytique',
      period: 'Période',
      today: 'Aujourd\'hui',
      last7Days: '7 derniers jours',
      last30Days: '30 derniers jours',
      last90Days: '90 derniers jours',
      allTime: 'Tout le temps',
      refresh: 'Actualiser',
      export: 'Exporter',
      
      // Métriques
      totalUsers: 'Utilisateurs totaux',
      newUsers: 'Nouveaux utilisateurs',
      activeUsers: 'Utilisateurs actifs',
      totalMessages: 'Messages totaux',
      avgMessagesPerUser: 'Moyenne messages/utilisateur',
      totalRevenue: 'Revenu total',
      mrr: 'MRR',
      conversionRate: 'Taux de conversion',
      churnRate: 'Taux de désabonnement',
      
      // Graphiques
      usersOverTime: 'Utilisateurs dans le temps',
      messagesOverTime: 'Messages dans le temps',
      revenueOverTime: 'Revenus dans le temps',
      subscriptionDistribution: 'Répartition des abonnements',
      userActivity: 'Activité utilisateurs',
      topUsers: 'Utilisateurs les plus actifs',
      
      // Labels
      users: 'Utilisateurs',
      messages: 'Messages',
      revenue: 'Revenus',
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      
      // Tendances
      vsLastPeriod: 'vs période précédente',
      growth: 'croissance',
      decline: 'baisse',
      noChange: 'stable',
      
      loading: 'Chargement...',
      noData: 'Aucune donnée'
    },
    en: {
      title: 'Analytics',
      period: 'Period',
      today: 'Today',
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      last90Days: 'Last 90 days',
      allTime: 'All time',
      refresh: 'Refresh',
      export: 'Export',
      
      // Metrics
      totalUsers: 'Total Users',
      newUsers: 'New Users',
      activeUsers: 'Active Users',
      totalMessages: 'Total Messages',
      avgMessagesPerUser: 'Avg Messages/User',
      totalRevenue: 'Total Revenue',
      mrr: 'MRR',
      conversionRate: 'Conversion Rate',
      churnRate: 'Churn Rate',
      
      // Charts
      usersOverTime: 'Users Over Time',
      messagesOverTime: 'Messages Over Time',
      revenueOverTime: 'Revenue Over Time',
      subscriptionDistribution: 'Subscription Distribution',
      userActivity: 'User Activity',
      topUsers: 'Most Active Users',
      
      // Labels
      users: 'Users',
      messages: 'Messages',
      revenue: 'Revenue',
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      
      // Trends
      vsLastPeriod: 'vs last period',
      growth: 'growth',
      decline: 'decline',
      noChange: 'no change',
      
      loading: 'Loading...',
      noData: 'No data'
    }
  }[language] || {
    title: 'Analytics', period: 'Period', today: 'Today', last7Days: '7 days', last30Days: '30 days',
    last90Days: '90 days', allTime: 'All time', refresh: 'Refresh', export: 'Export',
    totalUsers: 'Total Users', newUsers: 'New Users', activeUsers: 'Active Users',
    totalMessages: 'Total Messages', avgMessagesPerUser: 'Avg/User', totalRevenue: 'Revenue',
    mrr: 'MRR', conversionRate: 'Conversion', churnRate: 'Churn', usersOverTime: 'Users',
    messagesOverTime: 'Messages', revenueOverTime: 'Revenue', subscriptionDistribution: 'Subscriptions',
    userActivity: 'Activity', topUsers: 'Top Users', users: 'Users', messages: 'Messages',
    revenue: 'Revenue', free: 'Free', pro: 'Pro', premium: 'Premium', daily: 'Daily',
    weekly: 'Weekly', monthly: 'Monthly', vsLastPeriod: 'vs last', growth: 'growth',
    decline: 'decline', noChange: 'stable', loading: 'Loading...', noData: 'No data'
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Données de démonstration si l'API n'existe pas encore
        setAnalytics(generateMockData());
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  // Générer des données de démonstration
  const generateMockData = () => {
    const days = period === 'today' ? 1 : period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
    
    // Données temporelles
    const timeData = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      timeData.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }),
        users: Math.floor(Math.random() * 50) + 10,
        newUsers: Math.floor(Math.random() * 20) + 5,
        messages: Math.floor(Math.random() * 500) + 100,
        revenue: Math.floor(Math.random() * 500) + 50
      });
    }

    // Calculer les totaux
    const totalUsers = 1250 + Math.floor(Math.random() * 200);
    const newUsers = timeData.reduce((sum, d) => sum + d.newUsers, 0);
    const activeUsers = Math.floor(totalUsers * 0.65);
    const totalMessages = timeData.reduce((sum, d) => sum + d.messages, 0);
    const totalRevenue = timeData.reduce((sum, d) => sum + d.revenue, 0);

    return {
      summary: {
        totalUsers,
        newUsers,
        activeUsers,
        totalMessages,
        avgMessagesPerUser: (totalMessages / totalUsers).toFixed(1),
        totalRevenue,
        mrr: Math.floor(totalRevenue / (days / 30)),
        conversionRate: 32.5,
        churnRate: 2.3,
        // Tendances (comparaison avec période précédente)
        trends: {
          users: 12.5,
          messages: 8.3,
          revenue: 15.7,
          activeUsers: -2.1
        }
      },
      timeData,
      subscriptions: {
        free: Math.floor(totalUsers * 0.52),
        pro: Math.floor(totalUsers * 0.33),
        premium: Math.floor(totalUsers * 0.15)
      },
      topUsers: [
        { name: 'Ahmed M.', email: 'ahmed@...', messages: 523, tier: 'premium' },
        { name: 'Sarah L.', email: 'sarah@...', messages: 412, tier: 'pro' },
        { name: 'Mohammed K.', email: 'mohammed@...', messages: 387, tier: 'premium' },
        { name: 'Fatima A.', email: 'fatima@...', messages: 298, tier: 'pro' },
        { name: 'Omar B.', email: 'omar@...', messages: 245, tier: 'free' }
      ],
      activityByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        activity: Math.floor(Math.random() * 100) + (i >= 9 && i <= 22 ? 50 : 10)
      })),
      activityByDay: [
        { day: 'Lun', activity: 85 },
        { day: 'Mar', activity: 92 },
        { day: 'Mer', activity: 78 },
        { day: 'Jeu', activity: 95 },
        { day: 'Ven', activity: 110 },
        { day: 'Sam', activity: 65 },
        { day: 'Dim', activity: 55 }
      ]
    };
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = analytics.timeData.map(d => 
      `${d.date},${d.users},${d.newUsers},${d.messages},${d.revenue}`
    ).join('\n');
    
    const csv = `Date,Users,New Users,Messages,Revenue\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        {txt.noData}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header avec filtres */}
      <div className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.title}</h2>
        
        <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Sélecteur de période */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="today">{txt.today}</option>
            <option value="7days">{txt.last7Days}</option>
            <option value="30days">{txt.last30Days}</option>
            <option value="90days">{txt.last90Days}</option>
            <option value="all">{txt.allTime}</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={txt.refresh}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{txt.export}</span>
          </button>
        </div>
      </div>

      {/* Cartes de métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={txt.totalUsers}
          value={analytics.summary.totalUsers.toLocaleString()}
          trend={analytics.summary.trends.users}
          icon={Users}
          color="blue"
          isRTL={isRTL}
          txt={txt}
        />
        <MetricCard
          title={txt.activeUsers}
          value={analytics.summary.activeUsers.toLocaleString()}
          trend={analytics.summary.trends.activeUsers}
          icon={UserCheck}
          color="green"
          isRTL={isRTL}
          txt={txt}
        />
        <MetricCard
          title={txt.totalMessages}
          value={analytics.summary.totalMessages.toLocaleString()}
          trend={analytics.summary.trends.messages}
          icon={MessageSquare}
          color="purple"
          isRTL={isRTL}
          txt={txt}
        />
        <MetricCard
          title={txt.mrr}
          value={`$${analytics.summary.mrr.toLocaleString()}`}
          trend={analytics.summary.trends.revenue}
          icon={DollarSign}
          color="emerald"
          isRTL={isRTL}
          txt={txt}
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SmallMetricCard
          title={txt.newUsers}
          value={analytics.summary.newUsers}
          icon={UserPlus}
          isRTL={isRTL}
        />
        <SmallMetricCard
          title={txt.avgMessagesPerUser}
          value={analytics.summary.avgMessagesPerUser}
          icon={Activity}
          isRTL={isRTL}
        />
        <SmallMetricCard
          title={txt.conversionRate}
          value={`${analytics.summary.conversionRate}%`}
          icon={TrendingUp}
          isRTL={isRTL}
        />
        <SmallMetricCard
          title={txt.churnRate}
          value={`${analytics.summary.churnRate}%`}
          icon={TrendingDown}
          isRTL={isRTL}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique principal - Évolution temporelle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {chartType === 'users' ? txt.usersOverTime : chartType === 'messages' ? txt.messagesOverTime : txt.revenueOverTime}
            </h3>
            <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {['users', 'messages', 'revenue'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    chartType === type
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {txt[type]}
                </button>
              ))}
            </div>
          </div>
          <LineChart data={analytics.timeData} dataKey={chartType} isRTL={isRTL} />
        </div>

        {/* Répartition des abonnements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {txt.subscriptionDistribution}
          </h3>
          <DonutChart data={analytics.subscriptions} txt={txt} isRTL={isRTL} />
        </div>
      </div>

      {/* Activité et Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité par jour */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {txt.userActivity}
          </h3>
          <BarChart data={analytics.activityByDay} isRTL={isRTL} />
        </div>

        {/* Top utilisateurs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {txt.topUsers}
          </h3>
          <div className="space-y-3">
            {analytics.topUsers.map((user, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <TierBadge tier={user.tier} txt={txt} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {user.messages} msg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap d'activité par heure */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {txt.userActivity} (24h)
        </h3>
        <HourlyHeatmap data={analytics.activityByHour} isRTL={isRTL} />
      </div>
    </div>
  );
}

// Composant MetricCard
function MetricCard({ title, value, trend, icon: Icon, color, isRTL, txt }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600'
  };

  const isPositive = trend > 0;
  const isNeutral = trend === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
          <div className={`flex items-center gap-1 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : isNeutral ? null : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-500' : isNeutral ? 'text-gray-500' : 'text-red-500'
            }`}>
              {isPositive ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-gray-400">{txt.vsLastPeriod}</span>
          </div>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Composant SmallMetricCard
function SmallMetricCard({ title, value, icon: Icon, isRTL }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Composant TierBadge
function TierBadge({ tier, txt }) {
  const config = {
    free: { icon: null, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    pro: { icon: Zap, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    premium: { icon: Crown, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' }
  };
  const { icon: Icon, color } = config[tier] || config.free;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {txt[tier] || tier}
    </span>
  );
}

// Composant LineChart (SVG simple)
function LineChart({ data, dataKey, isRTL }) {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d[dataKey] || d.users || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const width = 100;
  const height = 40;
  const padding = 2;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((v - minValue) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  // Afficher seulement quelques labels
  const step = Math.ceil(data.length / 6);
  const labels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height + 10}`} className="w-full h-48">
        {/* Grille horizontale */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <line
            key={pct}
            x1={padding}
            y1={height - padding - (pct / 100) * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - (pct / 100) * (height - 2 * padding)}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={0.2}
          />
        ))}
        
        {/* Zone sous la courbe */}
        <polygon
          points={areaPoints}
          fill="url(#gradient)"
          opacity={0.3}
        />
        
        {/* Courbe */}
        <polyline
          points={points}
          fill="none"
          stroke="#10B981"
          strokeWidth={0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Points */}
        {values.map((v, i) => {
          const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((v - minValue) / range) * (height - 2 * padding);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={0.8}
              fill="#10B981"
            />
          );
        })}
        
        {/* Gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Labels */}
      <div className={`flex justify-between text-xs text-gray-400 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {labels.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// Composant DonutChart
function DonutChart({ data, txt, isRTL }) {
  const total = data.free + data.pro + data.premium;
  const segments = [
    { key: 'free', value: data.free, color: '#9CA3AF', label: txt.free },
    { key: 'pro', value: data.pro, color: '#3B82F6', label: txt.pro },
    { key: 'premium', value: data.premium, color: '#8B5CF6', label: txt.premium }
  ];

  let currentAngle = 0;
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  const innerRadius = 25;

  return (
    <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {segments.map((segment) => {
          const angle = (segment.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          const start = polarToCartesian(centerX, centerY, radius, startAngle);
          const end = polarToCartesian(centerX, centerY, radius, endAngle);
          const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
          const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          const d = [
            `M ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
            `L ${innerEnd.x} ${innerEnd.y}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
            'Z'
          ].join(' ');

          return (
            <path
              key={segment.key}
              d={d}
              fill={segment.color}
              className="transition-opacity hover:opacity-80"
            />
          );
        })}
        
        {/* Centre */}
        <circle cx={centerX} cy={centerY} r={innerRadius - 2} fill="white" className="dark:fill-gray-800" />
        <text x={centerX} y={centerY - 4} textAnchor="middle" className="text-lg font-bold fill-gray-800 dark:fill-gray-200" style={{ fontSize: '10px' }}>
          {total}
        </text>
        <text x={centerX} y={centerY + 6} textAnchor="middle" className="text-xs fill-gray-500" style={{ fontSize: '4px' }}>
          {txt.users}
        </text>
      </svg>
      
      {/* Légende */}
      <div className="space-y-2">
        {segments.map((segment) => (
          <div key={segment.key} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{segment.label}</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {segment.value} ({((segment.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

// Composant BarChart
function BarChart({ data, isRTL }) {
  const maxValue = Math.max(...data.map(d => d.activity));

  return (
    <div className={`flex items-end justify-between gap-2 h-40 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all hover:from-emerald-400 hover:to-teal-300"
            style={{ height: `${(item.activity / maxValue) * 100}%`, minHeight: '4px' }}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

// Composant HourlyHeatmap
function HourlyHeatmap({ data, isRTL }) {
  const maxActivity = Math.max(...data.map(d => d.activity));

  return (
    <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {data.map((item, index) => {
        const intensity = item.activity / maxActivity;
        const opacity = 0.2 + intensity * 0.8;
        
        return (
          <div key={index} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full h-8 rounded transition-all hover:scale-110"
              style={{ 
                backgroundColor: `rgba(16, 185, 129, ${opacity})`,
              }}
              title={`${item.hour}h: ${item.activity}`}
            />
            {index % 4 === 0 && (
              <span className="text-xs text-gray-400">{item.hour}h</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
