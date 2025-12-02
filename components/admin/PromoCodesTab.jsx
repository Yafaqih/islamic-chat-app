import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Check, X, Calendar, Users, TrendingUp,
  Edit2, Trash2, Copy, AlertCircle, CheckCircle
} from 'lucide-react';

/**
 * Onglet de gestion des codes promo
 */
export default function PromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/promo-codes');
      const data = await response.json();
      setPromoCodes(data.promoCodes);
    } catch (error) {
      console.error('Erreur chargement codes promo:', error);
      showNotification('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async (codeData) => {
    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(codeData)
      });

      if (response.ok) {
        showNotification('Code promo créé avec succès', 'success');
        loadPromoCodes();
        setShowCreateModal(false);
      } else {
        showNotification('Erreur lors de la création', 'error');
      }
    } catch (error) {
      console.error('Erreur création code promo:', error);
      showNotification('Erreur serveur', 'error');
    }
  };

  const handleToggleActive = async (codeId, isActive) => {
    try {
      await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeId, isActive })
      });
      showNotification(`Code ${isActive ? 'activé' : 'désactivé'}`, 'success');
      loadPromoCodes();
    } catch (error) {
      console.error('Erreur modification code:', error);
      showNotification('Erreur de modification', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Code copié !', 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getDiscountDisplay = (code) => {
    if (code.type === 'percentage') {
      return `${code.discount}%`;
    }
    return `$${code.discount}`;
  };

  const getUsageDisplay = (code) => {
    if (!code.maxUses) return 'Illimité';
    return `${code.usedCount} / ${code.maxUses}`;
  };

  const isExpired = (code) => {
    if (!code.expiresAt) return false;
    return new Date(code.expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Codes Promotionnels
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {promoCodes.length} codes créés
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau Code
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Codes Actifs</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {promoCodes.filter(c => c.isActive && !isExpired(c)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Utilisations</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {promoCodes.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux d'utilisation</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {promoCodes.length > 0 
                  ? Math.round((promoCodes.filter(c => c.usedCount > 0).length / promoCodes.length) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des codes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun code promo créé</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Créer votre premier code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Réduction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Utilisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {promoCodes.map((code) => (
                  <tr key={code._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                          title="Copier"
                        >
                          <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {getDiscountDisplay(code)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {getUsageDisplay(code)}
                        </div>
                        {code.maxUses && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round((code.usedCount / code.maxUses) * 100)}% utilisé
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {code.expiresAt ? (
                        <div className={isExpired(code) ? 'text-red-500' : ''}>
                          {new Date(code.expiresAt).toLocaleDateString('fr-FR')}
                          {isExpired(code) && <div className="text-xs">Expiré</div>}
                        </div>
                      ) : (
                        'Pas d\'expiration'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {code.isActive && !isExpired(code) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                          <Check className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                          <X className="w-3 h-3" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(code._id, !code.isActive)}
                          className={`p-2 rounded-lg transition-all ${
                            code.isActive
                              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={code.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {code.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <CreatePromoCodeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePromoCode}
        />
      )}
    </div>
  );
}

// Modal de création de code promo
function CreatePromoCodeModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    maxUses: '',
    expiresAt: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const data = {
      code: formData.code.toUpperCase(),
      discount: parseFloat(formData.discount),
      type: formData.type,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      expiresAt: formData.expiresAt || null
    };

    onCreate(data);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Créer un Code Promo
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="PROMO2024"
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono"
                required
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Générer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Réduction *
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder={formData.type === 'percentage' ? '10' : '5'}
                min="0"
                max={formData.type === 'percentage' ? '100' : undefined}
                step="0.01"
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre max d'utilisations (optionnel)
            </label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              placeholder="Illimité si vide"
              min="1"
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date d'expiration (optionnel)
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
            >
              Créer le Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
