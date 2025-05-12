const express = require('express');
const router = express.Router();
const TacheController = require('../controllers/tacheController');

const controller = new TacheController();

// إزالة authenticate لأنه لا يتم استخدامه الآن
router.get('/etudiant/:idEtudiant', controller.getTachesEtudiant.bind(controller));

module.exports = router;