const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');



// Rotas para fornecedores
router.post('/supplier', supplierController.createSupplier);
router.get('/supplier', supplierController.getSuppliers);
router.get('/supplier/search', supplierController.searchSuppliers);
router.get('/supplier/id', supplierController.getSupplierById);
router.patch('/supplier/:id', supplierController.updateSupplier);
router.delete('/supplier/:id', supplierController.deleteSupplier);

module.exports = router;