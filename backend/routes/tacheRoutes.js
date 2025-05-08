// backend/routes/tacheRoutes.js

const express = require('express');
const router = express.Router();
const tachecontroller = require('../controllers/tacheController');

// Route pour récupérer les tâches par étape
router.get('/etape/:id_etape', tachecontroller.getTachesByEtape);

module.exports = router;
