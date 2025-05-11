const express = require('express');
const router = express.Router();
const etapeController = require('../controllers/etapeController');

router.post('/etapes', etapeController.ajouterEtapes);

module.exports = router;
