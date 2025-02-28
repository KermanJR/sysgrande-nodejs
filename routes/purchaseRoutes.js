const purchaseController = require('../controllers/PurchaseController')
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

router.post('/purchase', purchaseController.createPurchase);
router.get('/purchase',  purchaseController.getPurchases);
//router.patch('/purchase/:id', upload.single('attachment'), purchaseController.updatePurchase);
router.put('/purchase/:id', upload.single('attachment'), purchaseController.updatePurchase);
router.delete('/purchase/:id', purchaseController.deletePurchase);

// Rotas adicionais
router.get('/purchase/period/search', purchaseController.getPurchasesByPeriod);
router.get('/purchase/supplier/search', purchaseController.getPurchasesBySupplier);

// Novas rotas para notificações
router.post('/check-reminders', purchaseController.checkPurchaseReminders);
router.get('/notifications/:id',  purchaseController.getPurchaseNotifications);
router.get('/notifications',  purchaseController.getAllNotifications);
router.post('/test-email/:id', purchaseController.testEmail); // Testa com uma compra específica
router.post('/test-email', purchaseController.testEmailGeneric); // Testa com dados fictícios
router.patch('/purchases/:purchaseId/notifications/:notificationId/read', purchaseController.markNotificationAsRead);

module.exports = router;