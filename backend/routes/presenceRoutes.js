// routes/presenceRoutes.js
const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presenceController');

router.post('/presences', (req, res) => {
    presenceController.enregistrerPresences(req, res);
});

router.get('/groupes/:groupeId/presences', (req, res) => {
    presenceController.getPresencesByGroupe(req, res);
});

module.exports = router;
