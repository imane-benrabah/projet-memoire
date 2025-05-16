const express = require('express');
const router = express.Router();
const sujetController = require('../controllers/sujetController');

// Routes pour les sujets
router.post('/ajouter', sujetController.ajouterSujet);
router.get('/sujets', sujetController.getAllSujets);
router.get('/sujets-par-responsable/:id', sujetController.getSujetsByResponsable);
router.get('/:id', sujetController.getSujetById);
router.get('/etudiant/:id', sujetController.getSujetByEtudiantId);
router.get('/:id/references', sujetController.getReferencesBySujetId);
router.get('/:id/prerequis', sujetController.getPrerequisBySujetId);

module.exports = router;