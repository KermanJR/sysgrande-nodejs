const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

// Rota para criar um novo local
router.post('/local', localController.createLocal);

// Rota para consultar locais por código do município
router.get('/local/:codigoMunicipio', localController.getLocaisByCodigoMunicipio);

// Rota para consultar locais por código do município
router.get('/local', localController.getAllLocals);

module.exports = router;
