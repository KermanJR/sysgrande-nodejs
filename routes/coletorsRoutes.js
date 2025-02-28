const express = require('express');
const router = express.Router();
const collectorController = require('../controllers/coletorsController');




// Rotas para gerenciamento de coletores
router.post('/collectors', collectorController.createCollector);
router.get('/collectors', collectorController.getAllCollectors);
router.get('/collectors/:id', collectorController.getCollectorById);
router.put('/collectors/:id', collectorController.updateCollector);
router.delete('/collectors/:id', collectorController.deleteCollector);

// Rota específica para registro de manutenção
router.post('/collectors/:id/maintenance', collectorController.addMaintenance);

module.exports = router;