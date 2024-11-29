const express = require('express');
const router = express.Router();
const despesaController = require('../controllers/expenseCategoryController');

// Rota para criar tipo de despesa
router.post('/despesas', despesaController.createDespesa);

// Rota para listar todos os tipos de despesas
router.get('/despesas', despesaController.getDespesas);

module.exports = router;
