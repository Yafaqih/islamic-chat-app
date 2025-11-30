// Script de test pour vérifier le reset mensuel
// Utilisation: node scripts/test-reset.js

const fetch = require('node-fetch');

async function testReset() {
  const CRON_SECRET = process.env.CRON_SECRET || 'votre_secret_ici';
  const API_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  console.log('🔄 Test du reset mensuel des messages Pro...\n');

  try {
    const response = await fetch(`${API_URL}/api/cron/reset-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Reset réussi !');
      console.log(`📊 Nombre d'utilisateurs Pro réinitialisés: ${data.resetCount}`);
      console.log(`⏰ Timestamp: ${data.timestamp}`);
    } else {
      console.log('❌ Erreur lors du reset');
      console.log('Statut:', response.status);
      console.log('Erreur:', data.error);
    }

  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
  }
}

testReset();