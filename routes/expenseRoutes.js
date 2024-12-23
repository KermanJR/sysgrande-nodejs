// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { addExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');

// POST: Adicionar despesa com upload de arquivo
router.post('/expenses', addExpense);

// GET: Listar todas as despesas
router.get('/expenses', getExpenses);


// DELETE: Remover despesa
router.delete('/expenses/:id', deleteExpense);

// Rotas específicas
router.post('/expenses/vacation', addExpense);
router.patch('/expenses/vacation/:id', updateExpense);
router.post('/expenses/fixed', addExpense);

module.exports = router;
