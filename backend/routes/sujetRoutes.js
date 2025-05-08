const express = require('express');
const router = express.Router();
const sujetController = require('../controllers/sujetController');


router.post('/ajouter', sujetController.ajouterSujet);

router.get('/:id', sujetController.getSujetById);

module.exports = router;
