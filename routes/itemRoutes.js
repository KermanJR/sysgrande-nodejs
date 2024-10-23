const express = require('express');
const router = express.Router();
const { addItem, getItems, updateItem, deleteItem } = require('../controllers/itemControllers');

// POST: Adicionar item
router.post('/items', addItem);

// GET: Listar todos os itens
router.get('/items', getItems);

// PUT: Atualizar item existente
router.patch('/items/:id', updateItem);

// DELETE: Remover item existente
router.delete('/items/:id', deleteItem);

module.exports = router;
