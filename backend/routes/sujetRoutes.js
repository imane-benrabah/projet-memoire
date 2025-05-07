// routes/sujetRoutes.js
const express = require('express');
const router = express.Router();
const sujetController = require('../controllers/sujetController');

router.get('/:id', sujetController.getSujetById);

module.exports = router;
