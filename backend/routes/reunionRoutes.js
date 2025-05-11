const express = require('express');
const router = express.Router();
const reunionController = require('../controllers/ReunionController');

router.post('/creer-reunion', reunionController.creerReunion);

module.exports = router;