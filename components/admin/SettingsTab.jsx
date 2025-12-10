// components/admin/SettingsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Settings, Bell, Shield, Key, Database, Globe, Mail,
  Save, RefreshCw, AlertTriangle, CheckCircle, Eye, EyeOff,
  Server, Zap, Users, MessageSquare, CreditCard, Palette,
  Lock, Unlock, Copy, Trash2, Plus, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * SettingsTab - Paramètres système de l'application
 */
export default function SettingsTab() {
  const { language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // États des paramètres
  const [settings, setSettings] = useState({
    // Général
    appName: 'Ya Faqih',
    appDescription: 'Assistant Islamique Intelligent',
    maintenanceMode: false,
    allowRegistration: true,
    defaultLanguage: 'ar',
    
    // Limites
    freeMessageLimit: 10,
    proMessageLimit: 100,
    premiumMessageLimit: -1, // illimité
    maxFileSize: 10, // MB
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    adminAlerts: true,
    weeklyReports: true,
    
    // Sécurité
    requireEmailVerification: true,
    twoFactorAuth: false,
    sessionTimeout: 30, // jours
    maxLoginAttempts: 5,
    
    // API
    apiKeys: [
      { id: 1, name: 'Production API', key: 'sk_live_xxxxx...', created: '2024-01-15', lastUsed: '2024-12-10' },
      { id: 2, name: 'Test API', key: 'sk_test_xxxxx...', created: '2024-03-20', lastUsed: '2024-12-08' }
    ],
    
    // Intégrations
    stripeEnabled: true,
    googleAuthEnabled: true,
    anthropicApiConfigured: true
  });

  const txt = {
    ar: {
      title: 'إعدادات النظام',
      general: 'عام',
      limits: 'الحدود',
      notifications: 'الإشعارات',
      security: 'الأمان',
      api: 'API',
      integrations: 'التكاملات',
      
      // General
      appName: 'اسم التطبيق',
      appDescription: 'وصف التطبيق',
      maintenanceMode: 'وضع الصيانة',
      maintenanceModeDesc: 'عند التفعيل، سيرى المستخدمون رسالة صيانة',
      allowRegistration: 'السماح بالتسجيل',
      allowRegistrationDesc: 'السماح للمستخدمين الجدد بإنشاء حسابات',
      defaultLanguage: 'اللغة الافتراضية',
      
      // Limits
      freeMessageLimit: 'حد الرسائل (مجاني)',
      proMessageLimit: 'حد الرسائل (Pro)',
      premiumMessageLimit: 'حد الرسائل (Premium)',
      maxFileSize: 'الحد الأقصى لحجم الملف (MB)',
      unlimited: 'غير محدود',
      messagesPerDay: 'رسالة/يوم',
      
      // Notifications
      emailNotifications: 'إشعارات البريد',
      emailNotificationsDesc: 'إرسال إشعارات بالبريد الإلكتروني',
      pushNotifications: 'الإشعارات الفورية',
      pushNotificationsDesc: 'إشعارات المتصفح',
      adminAlerts: 'تنبيهات المدير',
      adminAlertsDesc: 'تنبيهات للأحداث المهمة',
      weeklyReports: 'التقارير الأسبوعية',
      weeklyReportsDesc: 'تقرير أسبوعي بالبريد',
      
      // Security
      requireEmailVerification: 'التحقق من البريد',
      requireEmailVerificationDesc: 'يجب التحقق من البريد للتسجيل',
      twoFactorAuth: 'المصادقة الثنائية',
      twoFactorAuthDesc: 'تفعيل المصادقة الثنائية',
      sessionTimeout: 'مدة الجلسة (أيام)',
      maxLoginAttempts: 'محاولات الدخول القصوى',
      
      // API
      apiKeys: 'مفاتيح API',
      createApiKey: 'إنشاء مفتاح جديد',
      keyName: 'اسم المفتاح',
      key: 'المفتاح',
      created: 'تاريخ الإنشاء',
      lastUsed: 'آخر استخدام',
      copyKey: 'نسخ',
      deleteKey: 'حذف',
      
      // Integrations
      stripe: 'Stripe',
      stripeDesc: 'معالجة المدفوعات',
      googleAuth: 'Google Auth',
      googleAuthDesc: 'تسجيل الدخول بجوجل',
      anthropicApi: 'Anthropic API',
      anthropicApiDesc: 'Claude AI',
      configured: 'مُهيأ',
      notConfigured: 'غير مُهيأ',
      
      // Actions
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      saved: 'تم الحفظ بنجاح',
      reset: 'إعادة تعيين',
      test: 'اختبار',
      
      // Messages
      warning: 'تحذير',
      maintenanceWarning: 'تفعيل وضع الصيانة سيمنع وصول المستخدمين'
    },
    fr: {
      title: 'Paramètres Système',
      general: 'Général',
      limits: 'Limites',
      notifications: 'Notifications',
      security: 'Sécurité',
      api: 'API',
      integrations: 'Intégrations',
      
      // General
      appName: 'Nom de l\'application',
      appDescription: 'Description',
      maintenanceMode: 'Mode Maintenance',
      maintenanceModeDesc: 'Les utilisateurs verront un message de maintenance',
      allowRegistration: 'Autoriser l\'inscription',
      allowRegistrationDesc: 'Permettre aux nouveaux utilisateurs de créer un compte',
      defaultLanguage: 'Langue par défaut',
      
      // Limits
      freeMessageLimit: 'Limite messages (Free)',
      proMessageLimit: 'Limite messages (Pro)',
      premiumMessageLimit: 'Limite messages (Premium)',
      maxFileSize: 'Taille max fichier (MB)',
      unlimited: 'Illimité',
      messagesPerDay: 'messages/jour',
      
      // Notifications
      emailNotifications: 'Notifications email',
      emailNotificationsDesc: 'Envoyer des notifications par email',
      pushNotifications: 'Notifications push',
      pushNotificationsDesc: 'Notifications navigateur',
      adminAlerts: 'Alertes admin',
      adminAlertsDesc: 'Alertes pour événements importants',
      weeklyReports: 'Rapports hebdomadaires',
      weeklyReportsDesc: 'Rapport hebdomadaire par email',
      
      // Security
      requireEmailVerification: 'Vérification email',
      requireEmailVerificationDesc: 'Email requis pour l\'inscription',
      twoFactorAuth: 'Authentification 2FA',
      twoFactorAuthDesc: 'Activer l\'authentification à deux facteurs',
      sessionTimeout: 'Durée session (jours)',
      maxLoginAttempts: 'Tentatives max connexion',
      
      // API
      apiKeys: 'Clés API',
      createApiKey: 'Créer une clé',
      keyName: 'Nom',
      key: 'Clé',
      created: 'Créée le',
      lastUsed: 'Dernière utilisation',
      copyKey: 'Copier',
      deleteKey: 'Supprimer',
      
      // Integrations
      stripe: 'Stripe',
      stripeDesc: 'Traitement des paiements',
      googleAuth: 'Google Auth',
      googleAuthDesc: 'Connexion avec Google',
      anthropicApi: 'Anthropic API',
      anthropicApiDesc: 'Claude AI',
      configured: 'Configuré',
      notConfigured: 'Non configuré',
      
      // Actions
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      saved: 'Enregistré avec succès',
      reset: 'Réinitialiser',
      test: 'Tester',
      
      // Messages
      warning: 'Attention',
      maintenanceWarning: 'Le mode maintenance empêchera l\'accès des utilisateurs'
    },
    en: {
      title: 'System Settings',
      general: 'General',
      limits: 'Limits',
      notifications: 'Notifications',
      security: 'Security',
      api: 'API',
      integrations: 'Integrations',
      
      // General
      appName: 'App Name',
      appDescription: 'Description',
      maintenanceMode: 'Maintenance Mode',
      maintenanceModeDesc: 'Users will see a maintenance message',
      allowRegistration: 'Allow Registration',
      allowRegistrationDesc: 'Allow new users to create accounts',
      defaultLanguage: 'Default Language',
      
      // Limits
      freeMessageLimit: 'Message Limit (Free)',
      proMessageLimit: 'Message Limit (Pro)',
      premiumMessageLimit: 'Message Limit (Premium)',
      maxFileSize: 'Max File Size (MB)',
      unlimited: 'Unlimited',
      messagesPerDay: 'messages/day',
      
      // Notifications
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Send email notifications',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Browser notifications',
      adminAlerts: 'Admin Alerts',
      adminAlertsDesc: 'Alerts for important events',
      weeklyReports: 'Weekly Reports',
      weeklyReportsDesc: 'Weekly email report',
      
      // Security
      requireEmailVerification: 'Email Verification',
      requireEmailVerificationDesc: 'Require email verification for signup',
      twoFactorAuth: '2FA Authentication',
      twoFactorAuthDesc: 'Enable two-factor authentication',
      sessionTimeout: 'Session Duration (days)',
      maxLoginAttempts: 'Max Login Attempts',
      
      // API
      apiKeys: 'API Keys',
      createApiKey: 'Create Key',
      keyName: 'Name',
      key: 'Key',
      created: 'Created',
      lastUsed: 'Last Used',
      copyKey: 'Copy',
      deleteKey: 'Delete',
      
      // Integrations
      stripe: 'Stripe',
      stripeDesc: 'Payment processing',
      googleAuth: 'Google Auth',
      googleAuthDesc: 'Sign in with Google',
      anthropicApi: 'Anthropic API',
      anthropicApiDesc: 'Claude AI',
      configured: 'Configured',
      notConfigured: 'Not configured',
      
      // Actions
      save: 'Save Changes',
      saving: 'Saving...',
      saved: 'Saved successfully',
      reset: 'Reset',
      test: 'Test',
      
      // Messages
      warning: 'Warning',
      maintenanceWarning: 'Maintenance mode will block user access'
    }
  }[language] || {
    title: 'Settings', general: 'General', limits: 'Limits', notifications: 'Notifications',
    security: 'Security', api: 'API', integrations: 'Integrations', save: 'Save', saving: 'Saving...',
    saved: 'Saved', reset: 'Reset', test: 'Test', configured: 'OK', notConfigured: 'Not OK',
    unlimited: 'Unlimited', messagesPerDay: 'msg/day', warning: 'Warning'
  };

  const sections = [
    { id: 'general', label: txt.general, icon: Settings },
    { id: 'limits', label: txt.limits, icon: Zap },
    { id: 'notifications', label: txt.notifications, icon: Bell },
    { id: 'security', label: txt.security, icon: Shield },
    { id: 'api', label: txt.api, icon: Key },
    { id: 'integrations', label: txt.integrations, icon: Globe }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simuler une sauvegarde API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En production:
      // await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.title}</h2>
        
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{txt.saved}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? txt.saving : txt.save}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''} ${
                    activeSection === section.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}>
                  {txt.general}
                </h3>
                
                <div className="space-y-4">
                  <InputField
                    label={txt.appName}
                    value={settings.appName}
                    onChange={(v) => updateSetting('appName', v)}
                    isRTL={isRTL}
                  />
                  
                  <InputField
                    label={txt.appDescription}
                    value={settings.appDescription}
                    onChange={(v) => updateSetting('appDescription', v)}
                    isRTL={isRTL}
                  />
                  
                  <SelectField
                    label={txt.defaultLanguage}
                    value={settings.defaultLanguage}
                    onChange={(v) => updateSetting('defaultLanguage', v)}
                    options={[
                      { value: 'ar', label: 'العربية' },
                      { value: 'fr', label: 'Français' },
                      { value: 'en', label: 'English' }
                    ]}
                    isRTL={isRTL}
                  />
                  
                  <ToggleField
                    label={txt.allowRegistration}
                    description={txt.allowRegistrationDesc}
                    value={settings.allowRegistration}
                    onChange={(v) => updateSetting('allowRegistration', v)}
                    isRTL={isRTL}
                  />
                  
                  <ToggleField
                    label={txt.maintenanceMode}
                    description={txt.maintenanceModeDesc}
                    value={settings.maintenanceMode}
                    onChange={(v) => updateSetting('maintenanceMode', v)}
                    isRTL={isRTL}
                    warning={settings.maintenanceMode ? txt.maintenanceWarning : null}
                  />
                </div>
              </div>
            )}

            {/* Limits Settings */}
            {activeSection === 'limits' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}>
                  {txt.limits}
                </h3>
                
                <div className="space-y-4">
                  <NumberField
                    label={txt.freeMessageLimit}
                    value={settings.freeMessageLimit}
                    onChange={(v) => updateSetting('freeMessageLimit', v)}
                    suffix={txt.messagesPerDay}
                    isRTL={isRTL}
                  />
                  
                  <NumberField
                    label={txt.proMessageLimit}
                    value={settings.proMessageLimit}
                    onChange={(v) => updateSetting('proMessageLimit', v)}
                    suffix={txt.messagesPerDay}
                    isRTL={isRTL}
                  />
                  
                  <NumberField
                    label={txt.premiumMessageLimit}
                    value={settings.premiumMessageLimit}
                    onChange={(v) => updateSetting('premiumMessageLimit', v)}
                    suffix={settings.premiumMessageLimit === -1 ? txt.unlimited : txt.messagesPerDay}
                    isRTL={isRTL}
                  />
                  
                  <NumberField
                    label={txt.maxFileSize}
                    value={settings.maxFileSize}
                    onChange={(v) => updateSetting('maxFileSize', v)}
                    suffix="MB"
                    isRTL={isRTL}
                  />
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}>
                  {txt.notifications}
                </h3>
                
                <div className="space-y-4">
                  <ToggleField
                    label={txt.emailNotifications}
                    description={txt.emailNotificationsDesc}
                    value={settings.emailNotifications}
                    onChange={(v) => updateSetting('emailNotifications', v)}
                    isRTL={isRTL}
                  />
                  
                  <ToggleField
                    label={txt.pushNotifications}
                    description={txt.pushNotificationsDesc}
                    value={settings.pushNotifications}
                    onChange={(v) => updateSetting('pushNotifications', v)}
                    isRTL={isRTL}
                  />
                  
                  <ToggleField
                    label={txt.adminAlerts}
                    description={txt.adminAlertsDesc}
                    value={settings.adminAlerts}
                    onChange={(v) => updateSetting('adminAlerts', v)}
                    isRTL={isRTL}
                  />
                  
                  <ToggleField
                    label={txt.weeklyReports}
                    description={txt.weeklyReportsDesc}
                    value={settings.weeklyReports}
                    onChange={(v) => updateSetting('weeklyReports', v)}
                    isRTL={isRTL}
                  />
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}>
                  {txt.security}
                </h3>
                
                <div className="space-y-4">
                  <ToggleField
                    label={txt.requireEmailVerification}
                    description={txt.requireEmailVerificationDesc}
                    value={settings.requireEmailVerification}
                    onChange={(v) => updateSetting('requireEmailVerification', v)}
                    isRTL={isRTL}
                  />
                  
                  <ToggleField
                    label={txt.twoFactorAuth}
                    description={txt.twoFactorAuthDesc}
                    value={settings.twoFactorAuth}
                    onChange={(v) => updateSetting('twoFactorAuth', v)}
                    isRTL={isRTL}
                  />
                  
                  <NumberField
                    label={txt.sessionTimeout}
                    value={settings.sessionTimeout}
                    onChange={(v) => updateSetting('sessionTimeout', v)}
                    isRTL={isRTL}
                  />
                  
                  <NumberField
                    label={txt.maxLoginAttempts}
                    value={settings.maxLoginAttempts}
                    onChange={(v) => updateSetting('maxLoginAttempts', v)}
                    isRTL={isRTL}
                  />
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeSection === 'api' && (
              <div className="space-y-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {txt.apiKeys}
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                    <Plus className="w-4 h-4" />
                    <span>{txt.createApiKey}</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {settings.apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{apiKey.name}</p>
                          <p className="text-sm text-gray-500 font-mono">
                            {showApiKey ? apiKey.key : '••••••••••••••••'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {txt.lastUsed}: {apiKey.lastUsed}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Settings */}
            {activeSection === 'integrations' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}>
                  {txt.integrations}
                </h3>
                
                <div className="space-y-4">
                  <IntegrationCard
                    name={txt.stripe}
                    description={txt.stripeDesc}
                    icon={CreditCard}
                    isConfigured={settings.stripeEnabled}
                    txt={txt}
                    isRTL={isRTL}
                  />
                  
                  <IntegrationCard
                    name={txt.googleAuth}
                    description={txt.googleAuthDesc}
                    icon={Globe}
                    isConfigured={settings.googleAuthEnabled}
                    txt={txt}
                    isRTL={isRTL}
                  />
                  
                  <IntegrationCard
                    name={txt.anthropicApi}
                    description={txt.anthropicApiDesc}
                    icon={MessageSquare}
                    isConfigured={settings.anthropicApiConfigured}
                    txt={txt}
                    isRTL={isRTL}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Field Component
function InputField({ label, value, onChange, isRTL }) {
  return (
    <div>
      <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
      />
    </div>
  );
}

// Number Field Component
function NumberField({ label, value, onChange, suffix, isRTL }) {
  return (
    <div>
      <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
        {label}
      </label>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className={`w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
        />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

// Select Field Component
function SelectField({ label, value, onChange, options, isRTL }) {
  return (
    <div>
      <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Toggle Field Component
function ToggleField({ label, description, value, onChange, isRTL, warning }) {
  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        {warning && (
          <div className={`flex items-center gap-2 mt-2 text-orange-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{warning}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')
          }`}
        />
      </button>
    </div>
  );
}

// Integration Card Component
function IntegrationCard({ name, description, icon: Icon, isConfigured, txt, isRTL }) {
  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isConfigured 
            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
            : 'bg-gray-200 dark:bg-gray-600'
        }`}>
          <Icon className={`w-6 h-6 ${
            isConfigured 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`} />
        </div>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="font-medium text-gray-800 dark:text-gray-200">{name}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          isConfigured 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          {isConfigured ? (
            <>
              <CheckCircle className="w-3 h-3" />
              {txt.configured}
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3" />
              {txt.notConfigured}
            </>
          )}
        </span>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
