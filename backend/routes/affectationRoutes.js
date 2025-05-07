// affectationRoutes.js
const express = require('express');
const router = express.Router();
const affectationController = require('../controllers/affectationController');

// Affecter un enseignant à un groupe
router.post('/affecter', affectationController.affecterEnseignant);

// Lister les groupes sans enseignant
router.get('/groupes-sans-enseignant', affectationController.listerGroupesSansEnseignant);

module.exports = router;