const express = require('express');
const router = express.Router();
const RapportController = require('../controllers/rapportController');

const controller = new RapportController();

// حذف middleware الخاص بالتوثيق
router.post('/deposer', controller.deposerRapport.bind(controller));

module.exports = router;
