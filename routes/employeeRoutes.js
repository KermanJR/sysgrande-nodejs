const express = require('express');
const employeeController = require('../controllers/employeeController');
const router = express.Router();

// Criar um novo funcionário
router.post('/employees', employeeController.createEmployee);

// Consultar todos os funcionários
router.get('/employees', employeeController.getAllEmployees);

// Consultar um funcionário por ID
router.get('/employees/:id', employeeController.getEmployeeById);

// Rota para deletar um funcionário (soft delete)
router.delete('/employees/:id', employeeController.deleteEmployee);

module.exports = router;
