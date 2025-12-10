// components/admin/PermissionsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield, Check, X, RefreshCw, Save, User, Zap, Crown,
  MessageSquare, BookOpen, Compass, Clock, FileText,
  Headphones, Sparkles, Moon, Globe, MapPin, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * PermissionsTab - Gestion des permissions par plan
 */
export default function PermissionsTab() {
  const { language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [definitions, setDefinitions] = useState([]);
  const [categories, setCategories] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const txt = {
    ar: {
      title: 'إدارة الصلاحيات',
      subtitle: 'تحديد الصلاحيات المتاحة لكل خطة',
      free: 'مجاني',
      pro: 'احترافي',
      premium: 'مميز',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      saved: 'تم الحفظ بنجاح',
      loading: 'جاري التحميل...',
      unlimited: 'غير محدود',
      enabled: 'مفعل',
      disabled: 'معطل',
      messagesPerDay: 'رسالة/يوم'
    },
    fr: {
      title: 'Gestion des Permissions',
      subtitle: 'Définir les permissions disponibles pour chaque forfait',
      free: 'Gratuit',
      pro: 'Pro',
      premium: 'Premium',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      saved: 'Enregistré avec succès',
      loading: 'Chargement...',
      unlimited: 'Illimité',
      enabled: 'Activé',
      disabled: 'Désactivé',
      messagesPerDay: 'messages/jour'
    },
    en: {
      title: 'Permissions Management',
      subtitle: 'Define available permissions for each plan',
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved successfully',
      loading: 'Loading...',
      unlimited: 'Unlimited',
      enabled: 'Enabled',
      disabled: 'Disabled',
      messagesPerDay: 'messages/day'
    }
  }[language] || {};

  const tiers = [
    { id: 'free', name: txt.free, icon: User, color: 'gray' },
    { id: 'pro', name: txt.pro, icon: Zap, color: 'blue' },
    { id: 'premium', name: txt.premium, icon: Crown, color: 'purple' }
  ];

  // Icônes par permission
  const permissionIcons = {
    dailyMessageLimit: MessageSquare,
    quranAccess: BookOpen,
    hadithAccess: BookOpen,
    prayerTimes: Clock,
    qiblaCompass: Compass,
    mosqueFinder: MapPin,
    saveConversations: FileText,
    exportPDF: FileText,
    advancedResponses: Sparkles,
    responsesWithReferences: BookOpen,
    khutbaPreparation: Sparkles,
    fastSupport: Headphones,
    prioritySupport: Headphones,
    exclusiveFeatures: Sparkles,
    darkMode: Moon,
    multiLanguage: Globe
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions/permissions');
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions);
        setDefinitions(data.definitions || []);
        setCategories(data.categories || {});
      }
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (tier, key, value) => {
    setPermissions(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [key]: value
      }
    }));
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/subscriptions/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Grouper les permissions par catégorie
  const groupedPermissions = definitions.reduce((acc, def) => {
    const cat = def.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(def);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="ml-3 text-gray-500">{txt.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-500" />
            {txt.title}
          </h2>
          <p className="text-gray-500 mt-1">{txt.subtitle}</p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <Check className="w-4 h-4" />
              <span className="text-sm">{txt.saved}</span>
            </div>
          )}
          
          <button
            onClick={savePermissions}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? txt.saving : txt.save}
          </button>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header - Plans */}
        <div className={`grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 ${isRTL ? 'text-right' : ''}`}>
          <div className="font-semibold text-gray-600 dark:text-gray-400">
            Permission
          </div>
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div 
                key={tier.id}
                className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tier.color === 'gray' ? 'bg-gray-100 dark:bg-gray-600' :
                  tier.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    tier.color === 'gray' ? 'text-gray-600' :
                    tier.color === 'blue' ? 'text-blue-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{tier.name}</span>
              </div>
            );
          })}
        </div>

        {/* Permissions by Category */}
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div key={category}>
            {/* Category Header */}
            <div className={`px-4 py-3 bg-gray-100 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600 ${isRTL ? 'text-right' : ''}`}>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {categories[category]?.[language] || categories[category]?.en || category}
              </span>
            </div>

            {/* Permission Rows */}
            {perms.map((perm) => {
              const Icon = permissionIcons[perm.key] || Shield;
              
              return (
                <div 
                  key={perm.key}
                  className={`grid grid-cols-4 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors ${isRTL ? 'text-right' : ''}`}
                >
                  {/* Permission Label */}
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Icon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {perm.labels?.[language] || perm.labels?.en || perm.key}
                      </p>
                      {perm.description && (
                        <p className="text-xs text-gray-400">
                          {perm.description[language] || perm.description.en}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Values for each tier */}
                  {tiers.map((tier) => {
                    const value = permissions?.[tier.id]?.[perm.key];

                    // Number input (for dailyMessageLimit)
                    if (perm.type === 'number') {
                      return (
                        <div key={tier.id} className="flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={value || 0}
                              onChange={(e) => handlePermissionChange(tier.id, perm.key, parseInt(e.target.value) || 0)}
                              className="w-20 px-3 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            />
                            <span className="text-xs text-gray-500">
                              {value === -1 ? txt.unlimited : ''}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Boolean toggle
                    return (
                      <div key={tier.id} className="flex items-center justify-center">
                        <button
                          onClick={() => handlePermissionChange(tier.id, perm.key, !value)}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            value 
                              ? 'bg-emerald-500' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              value 
                                ? (isRTL ? 'left-1' : 'right-1') 
                                : (isRTL ? 'right-1' : 'left-1')
                            }`}
                          />
                          <span className={`absolute inset-0 flex items-center ${value ? (isRTL ? 'justify-end pr-2' : 'justify-start pl-2') : (isRTL ? 'justify-start pl-2' : 'justify-end pr-2')}`}>
                            {value ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400" />
                            )}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={`flex items-center gap-6 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-4 h-4 bg-emerald-500 rounded-full" />
          <span>{txt.enabled}</span>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>{txt.disabled}</span>
        </div>
      </div>
    </div>
  );
}
