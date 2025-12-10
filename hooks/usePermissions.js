// hooks/usePermissions.js
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook pour gérer les permissions utilisateur
 * 
 * Usage:
 * const { can, permissions, usage, loading, refresh } = usePermissions();
 * 
 * // Vérifier une permission
 * if (can('hadithAccess')) { ... }
 * if (can('qiblaCompass')) { ... }
 * 
 * // Vérifier si l'utilisateur peut envoyer un message
 * if (usage.canSendMessage) { ... }
 * 
 * // Afficher les messages restants
 * console.log(`${usage.messagesRemaining} messages restants`);
 */
export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState(null);
  const [usage, setUsage] = useState({
    messagesUsedToday: 0,
    messagesRemaining: 10,
    dailyLimit: 10,
    canSendMessage: true
  });
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les permissions
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/permissions');
      
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions);
        setUsage(data.usage);
        setTier(data.tier);
        setError(null);
      } else {
        throw new Error('Failed to fetch permissions');
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err.message);
      
      // Fallback aux permissions free
      setPermissions({
        dailyMessageLimit: 10,
        quranAccess: true,
        prayerTimes: true,
        hadithAccess: false,
        qiblaCompass: false,
        saveConversations: false,
        exportPDF: false,
        prioritySupport: false,
        fastSupport: false,
        advancedResponses: false,
        responsesWithReferences: false,
        khutbaPreparation: false,
        exclusiveFeatures: false,
        mosqueFinder: true,
        darkMode: true,
        multiLanguage: true
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au montage et quand la session change
  useEffect(() => {
    if (status !== 'loading') {
      fetchPermissions();
    }
  }, [status, session?.user?.subscriptionTier, fetchPermissions]);

  // Vérifier si une permission est activée
  const can = useCallback((permissionKey) => {
    if (!permissions) return false;
    return permissions[permissionKey] === true;
  }, [permissions]);

  // Vérifier si l'utilisateur peut utiliser une fonctionnalité (avec message si non)
  const canUse = useCallback((permissionKey) => {
    if (!permissions) {
      return { allowed: false, reason: 'loading' };
    }

    const isAllowed = permissions[permissionKey] === true;

    if (isAllowed) {
      return { allowed: true };
    }

    // Déterminer quel plan est requis
    let requiredPlan = 'pro';
    const premiumOnly = ['exportPDF', 'prioritySupport', 'responsesWithReferences', 'khutbaPreparation', 'exclusiveFeatures'];
    
    if (premiumOnly.includes(permissionKey)) {
      requiredPlan = 'premium';
    }

    return { 
      allowed: false, 
      reason: 'upgrade_required',
      requiredPlan
    };
  }, [permissions]);

  // Obtenir la limite de messages
  const getMessageLimit = useCallback(() => {
    return usage.dailyLimit;
  }, [usage]);

  // Vérifier si l'utilisateur peut envoyer un message
  const canSendMessage = useCallback(() => {
    return usage.canSendMessage;
  }, [usage]);

  // Rafraîchir les permissions (utile après un upgrade)
  const refresh = useCallback(() => {
    return fetchPermissions();
  }, [fetchPermissions]);

  return {
    // État
    permissions,
    usage,
    tier,
    loading,
    error,
    
    // Méthodes
    can,
    canUse,
    canSendMessage,
    getMessageLimit,
    refresh,
    
    // Raccourcis pour les permissions courantes
    isPro: tier === 'pro' || tier === 'premium',
    isPremium: tier === 'premium',
    isFree: tier === 'free'
  };
}

// Export par défaut
export default usePermissions;


/**
 * HOC pour protéger un composant avec une permission
 * 
 * Usage:
 * export default withPermission(MyComponent, 'hadithAccess');
 */
export function withPermission(Component, requiredPermission) {
  return function ProtectedComponent(props) {
    const { can, loading } = usePermissions();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!can(requiredPermission)) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
          <p className="text-yellow-600 dark:text-yellow-400">
            Cette fonctionnalité nécessite un abonnement supérieur.
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}


/**
 * Composant pour afficher conditionnellement selon une permission
 * 
 * Usage:
 * <PermissionGate permission="hadithAccess">
 *   <HadithComponent />
 * </PermissionGate>
 * 
 * <PermissionGate permission="exportPDF" fallback={<UpgradePrompt />}>
 *   <ExportButton />
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }) {
  const { can, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (can(permission)) {
    return children;
  }

  return fallback;
}
