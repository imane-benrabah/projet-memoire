// routes/tacheRoutes.js

const express = require('express');
const router = express.Router();
const tachecontroller = require('../controllers/tacheController');

// route: GET /etapes
router.get('/', tachecontroller.getAllEtapes);

module.exports = router;

