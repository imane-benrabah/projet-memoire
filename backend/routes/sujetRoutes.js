const express = require('express');
const router = express.Router();
const sujetController = require('../controllers/sujetController');

router.post('/ajouter', sujetController.ajouterSujet);

module.exports = router;
