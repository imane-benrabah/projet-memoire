const express = require('express');
const router = express.Router();
const etapesModel = require('../models/etapemodel');

// /etapes
// routes/etapesRoutes.js
router.get('/', (req, res) => {
    etapesModel.getAllEtapes((err, etapes) => {
        if (err) {
            console.error('Erreur lors de la récupération des étapes:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(etapes);
    });
});
module.exports = router;
