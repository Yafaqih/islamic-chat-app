import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Mail, Shield, Crown, 
  Calendar, MessageSquare, Ban, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Edit2, Trash2
} from 'lucide-react';

/**
 * Onglet de gestion des utilisateurs
 * URLs API corrigées
 */
export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, filterTier]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // ✅ URL CORRIGÉE: /api/admin/users/list
      const response = await fetch(
        `/api/admin/users/list?page=${currentPage}&limit=20&search=${searchTerm}&tier=${filterTier}`
      );
      const data = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch (error) {
      console.error('Erreur chargement users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      // ✅ URL CORRIGÉE: /api/admin/users/[id]
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      loadUsers();
      setShowEditModal(false);
    } catch (error) {
      console.error('Erreur mise à jour user:', error);
    }
  };

  const exportUsers = async () => {
    try {
      // ✅ URL CORRIGÉE: /api/admin/users/export
      window.open(`/api/admin/users/export?tier=${filterTier}&search=${searchTerm}`, '_blank');
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      free: { label: 'Free', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      pro: { label: 'Pro', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      premium: { label: 'Premium', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }
    };
    const badge = badges[tier] || badges.free;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Gestion des Utilisateurs
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {pagination.total} utilisateurs au total
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex-1 md:flex-initial">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
                />
              </div>
            </form>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200"
            >
              <option value="all">Tous</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>

            <button
              onClick={exportUsers}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Abonnement
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {user.name || 'Sans nom'}
                          </div>
                          {user.isAdmin && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTierBadge(user.subscriptionTier)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        {user.messageCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} sur {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
}

// Modal de modification d'utilisateur
function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    subscriptionTier: user.subscriptionTier || 'free',
    messageCount: user.messageCount || 0,
    isAdmin: user.isAdmin || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ Utilise user.id (pas user._id)
    onSave(user.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Modifier l'utilisateur
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={user.name || ''}
              disabled
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="text"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Abonnement
            </label>
            <select
              value={formData.subscriptionTier}
              onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de messages
            </label>
            <input
              type="number"
              value={formData.messageCount}
              onChange={(e) => setFormData({ ...formData, messageCount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="isAdmin" className="text-sm text-gray-700 dark:text-gray-300">
              Droits administrateur
            </label>
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
