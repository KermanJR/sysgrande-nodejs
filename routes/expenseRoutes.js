// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');

// POST: Adicionar despesa com upload de arquivo
router.post('/expenses', addExpense);

// GET: Listar todas as despesas
router.get('/expenses', getExpenses);

// PUT: Atualizar despesa
router.patch('/expenses/:id', updateExpense);

// DELETE: Remover despesa
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
