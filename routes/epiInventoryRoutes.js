const express = require('express');
const EpiInventoryController = require('../controllers/epiInventoryController');
const router = express.Router();

// Criar um novo funcionário
router.post('/epi', EpiInventoryController.addToInventory);

// Consultar todos os funcionários
router.get('/epi', EpiInventoryController.getInventory);

// Consultar um funcionário por ID
//router.get('/epi/:id', epiController.getEmployeeById);

// Rota para atualizar um funcionário 
//router.patch('/employees/:id', epiController.updateEmployee);

// Rota para deletar um funcionário (soft delete)
router.delete('/epi/:id', EpiInventoryController.deleteInventory);

module.exports = router;
