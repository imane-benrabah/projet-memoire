const express = require('express');
const router = express.Router();
const binomeController = require('../controllers/BinomeController');

// Route pour affecter une responsabilité à un binôme
router.post('/affecter-responsabilite', binomeController.affecterResponsabilite);

module.exports = router;