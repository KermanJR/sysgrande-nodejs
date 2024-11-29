const express = require('express');
const router = express.Router();
const municipioController = require('../controllers/municipioController');

// Rota para criar um novo município
router.post('/municipios', municipioController.createMunicipio);

// Rota para consultar municípios por código da regional
router.get('/municipios/:codigoRegional', municipioController.getMunicipiosByCodigoRegional);


// Rota para consultar todos os municípios
router.get('/municipios', municipioController.getAllMunicipios);

module.exports = router;
