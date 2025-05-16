const express = require('express');
const router = express.Router();
const tacheController = require('../controllers/tacheController');

/**
 * @route   GET /api/rapports/etudiants/:idEtudiant/taches
 * @desc    Récupère toutes les tâches associées à un étudiant
 * @access  Private
 */
router.get('/rapports/etudiants/:idEtudiant/taches', tacheController.getTachesByEtudiant);

/**
 * @route   POST /api/rapports/deposer
 * @desc    Dépose un nouveau rapport pour une tâche
 * @access  Private
 */
router.post('/rapports/deposer', tacheController.deposerRapport);

module.exports = router;