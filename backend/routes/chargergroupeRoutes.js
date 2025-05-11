// routes/groupeRoutes.js
const express = require('express');
const router = express.Router();
const chargergroupeController = require('../controllers/chargergroupeController'); // ⬅️ Cette ligne manque

// Route pour récupérer les groupes
router.get('/groupes', chargergroupeController.getGroupes);

module.exports = router;
