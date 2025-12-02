const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products...');

  const products = [
    {
      name: 'Plan Gratuit',
      tier: 'free',
      description: 'Accès de base',
      price: 0,
      billingPeriod: 'lifetime',
      messageLimit: 10,
      features: ['10 messages/mois', 'Support communauté'],
      isActive: true,
    },
    {
      name: 'Plan Pro',
      tier: 'pro',
      description: 'Pour utilisateurs réguliers',
      price: 9.99,
      billingPeriod: 'monthly',
      messageLimit: 100,
      features: ['100 messages/mois', 'Support prioritaire', 'Historique complet'],
      isActive: true,
      isPopular: true,
    },
    {
      name: 'Plan Premium',
      tier: 'premium',
      description: 'Accès illimité',
      price: 29.99,
      billingPeriod: 'monthly',
      messageLimit: 999999,
      features: ['Messages illimités', 'Support VIP', 'Export PDF', 'Toutes les fonctionnalités'],
      isActive: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { tier: product.tier },
      update: {},
      create: product,
    });
    console.log(`✅ Produit créé: ${product.name}`);
  }

  console.log('🎉 Seed terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });