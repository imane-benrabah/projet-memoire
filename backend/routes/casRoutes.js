// routes/casRoutes.js
const express = require('express');
const router = express.Router();
const casController = require('../controllers/casController');

router.get('/api/cas/:id', casController.getCasEtudiant);

module.exports = router;
