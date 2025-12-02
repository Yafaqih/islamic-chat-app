import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, CreditCard, Tag, Key, TrendingUp, 
  Settings, LogOut, Search, Filter, Download, RefreshCw,
  DollarSign, UserCheck, UserX, Calendar, Clock, Activity,
  Package, Zap, Shield, AlertCircle, CheckCircle, XCircle, X
} from 'lucide-react';

// Import des onglets
import UsersTab from './admin/UsersTab';
import PromoCodesTab from './admin/PromoCodesTab';

/**
 * Dashboard Admin Complet pour Ya Faqih
 * Gestion: Utilisateurs, Abonnements, Analytiques, Codes Promo, etc.
 */
export default function AdminDashboard({ user, onLogout, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  // Charger les statistiques
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
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Accès Refusé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous n'avez pas les permissions pour accéder au dashboard admin.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Ya Faqih Admin
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Console d'administration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sélecteur de période */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="today">Aujourd'hui</option>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="all">Tout le temps</option>
              </select>

              {/* Rafraîchir */}
              <button
                onClick={loadStats}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
                  {user?.name || 'Admin'}
                </span>
              </div>

              {/* Fermer */}
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
              { id: 'promo', label: 'Codes Promo', icon: Tag },
              { id: 'analytics', label: 'Analytique', icon: TrendingUp },
              { id: 'settings', label: 'Paramètres', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
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
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} loading={loading} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'promo' && <PromoCodesTab />}
        {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

// ============================================
// ONGLET: VUE D'ENSEMBLE
// ============================================
function OverviewTab({ stats, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const mockStats = stats || {
    totalUsers: 1250,
    activeUsers: 890,
    newUsers: 145,
    totalRevenue: 12450,
    mrr: 4200,
    subscriptions: {
      free: 650,
      pro: 420,
      premium: 180
    },
    messages: {
      total: 45320,
      today: 1234
    },
    conversion: 32.5
  };

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Utilisateurs Totaux */}
        <StatCard
          title="Utilisateurs Totaux"
          value={mockStats.totalUsers.toLocaleString()}
          change="+12.5%"
          changeType="positive"
          icon={Users}
          color="blue"
        />

        {/* Utilisateurs Actifs */}
        <StatCard
          title="Utilisateurs Actifs"
          value={mockStats.activeUsers.toLocaleString()}
          change="+8.2%"
          changeType="positive"
          icon={UserCheck}
          color="green"
        />

        {/* Revenu Total */}
        <StatCard
          title="Revenu Total"
          value={`$${mockStats.totalRevenue.toLocaleString()}`}
          change="+23.1%"
          changeType="positive"
          icon={DollarSign}
          color="purple"
        />

        {/* MRR */}
        <StatCard
          title="MRR (Revenu Mensuel)"
          value={`$${mockStats.mrr.toLocaleString()}`}
          change="+15.7%"
          changeType="positive"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des abonnements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Répartition des Abonnements
          </h3>
          <div className="space-y-3">
            <SubscriptionBar label="Free" count={mockStats.subscriptions.free} total={mockStats.totalUsers} color="gray" />
            <SubscriptionBar label="Pro" count={mockStats.subscriptions.pro} total={mockStats.totalUsers} color="blue" />
            <SubscriptionBar label="Premium" count={mockStats.subscriptions.premium} total={mockStats.totalUsers} color="purple" />
          </div>
        </div>

        {/* Activité Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Activité Messages
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {mockStats.messages.total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Aujourd'hui</span>
              <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {mockStats.messages.today.toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Moyenne/utilisateur</span>
                <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {(mockStats.messages.total / mockStats.totalUsers).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dernières activités */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Activité Récente
        </h3>
        <div className="space-y-3">
          <ActivityItem
            icon={UserCheck}
            text="Nouvel utilisateur inscrit"
            user="Ahmed Mohamed"
            time="Il y a 5 min"
            color="green"
          />
          <ActivityItem
            icon={CreditCard}
            text="Nouvel abonnement Premium"
            user="Fatima Ali"
            time="Il y a 12 min"
            color="purple"
          />
          <ActivityItem
            icon={Tag}
            text="Code promo utilisé"
            user="Omar Hassan"
            time="Il y a 23 min"
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}

// Composant StatCard
function StatCard({ title, value, change, changeType, icon: Icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-sm font-semibold ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}

// Composant SubscriptionBar
function SubscriptionBar({ label, count, total, color }) {
  const percentage = (count / total * 100).toFixed(1);
  const colors = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{count} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`${colors[color]} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// Composant ActivityItem
function ActivityItem({ icon: Icon, text, user, time, color }) {
  const colors = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className={`w-10 h-10 ${colors[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{text}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{user}</p>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-500">{time}</span>
    </div>
  );
}

// Placeholder pour les autres onglets
function SubscriptionsTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Gestion des Abonnements
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Onglet en développement
      </p>
    </div>
  );
}

function AnalyticsTab({ stats }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
      <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Analytique Détaillée
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Graphiques et rapports détaillés (en développement)
      </p>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
      <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Paramètres
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Configuration du système (en développement)
      </p>
    </div>
  );
}
