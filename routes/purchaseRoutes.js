const purchaseController = require('../controllers/PurchaseController')
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

router.post('/purchase', purchaseController.createPurchase);
router.get('/purchase',  purchaseController.getPurchases);
router.patch('/purchase/:id', upload.single('attachment'), purchaseController.updatePurchase);
router.delete('/purchase/:id', purchaseController.deletePurchase);

// Rotas adicionais
router.get('/purchase/period/search', purchaseController.getPurchasesByPeriod);
router.get('/purchase/supplier/search', purchaseController.getPurchasesBySupplier);

module.exports = router;