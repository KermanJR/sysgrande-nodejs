const express = require('express');
const router = express.Router();
const { addRegional, getRegionals } = require('../controllers/regionalController');

// POST: Adicionar nova regional
router.post('/regionals', addRegional);

// GET: Listar todas as regionais
router.get('/regionals', getRegionals);

module.exports = router;
