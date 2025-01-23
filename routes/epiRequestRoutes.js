const express = require('express');
const EpiRequestController = require('../controllers/epiRequestController');
const router = express.Router();

// Criar um novo funcionário
router.post('/epi-request', EpiRequestController.createEpiRequest);

// Consultar todos os funcionários
router.get('/epi-request', EpiRequestController.getEpiRequests);

// Consultar um funcionário por ID
//router.get('/epi/:id', epiController.getEmployeeById);

// Rota para atualizar um funcionário 
//router.patch('/employees/:id', epiController.updateEmployee);

// Rota para deletar um funcionário (soft delete)
//router.delete('/employees/:id', epiController.deleteEmployee);

module.exports = router;
