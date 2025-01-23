// services/purchaseReminderService.js
const cron = require('node-cron');
const Purchase = require('../models/Purchase');
const { sendPurchaseReminderEmail } = require('./emailService');

const checkPurchasesForReminder = async () => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const purchases = await Purchase.find({
      deletedAt: null,
      purchaseDate: { $exists: true },
      'notifications.nextPurchaseDate': { $exists: false }
    }).populate('supplier');

    for (const purchase of purchases) {
      const purchaseDate = new Date(purchase.purchaseDate);
      const nextPurchaseDate = new Date(purchaseDate);
      nextPurchaseDate.setMonth(nextPurchaseDate.getMonth() + 3);

      // Verifica se está dentro da janela de notificação (7 dias antes)
      if (nextPurchaseDate > now && nextPurchaseDate <= sevenDaysFromNow) {
        const emailSent = await sendPurchaseReminderEmail(purchase);

        // Registra a notificação
        purchase.notifications.push({
          type: 'recompra',
          sentAt: new Date(),
          nextPurchaseDate: nextPurchaseDate,
          status: emailSent ? 'sent' : 'failed',
          emailTo: purchase.createdBy
        });

        await purchase.save();
      }
    }
  } catch (error) {
    console.error('Erro ao verificar lembretes de compra:', error);
  }
};

// Executa todos os dias às 9h
const startPurchaseReminderScheduler = () => {
  cron.schedule('0 9 * * *', checkPurchasesForReminder);
};

// Função para verificação manual (útil para testes)
const checkPurchasesManually = async () => {
  await checkPurchasesForReminder();
};

module.exports = { 
  startPurchaseReminderScheduler, 
  checkPurchasesManually 
};