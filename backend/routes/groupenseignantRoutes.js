// backend/routes/groupeRoutes.js (Express)
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // connexion MySQL

const { mainDb } = require('../config/db');

router.get('/groupes-par-enseignant/:id', async (req, res) => {
    const enseignantId = req.params.id;
    try {
        const [rows] = await mainDb.query(
            'SELECT idG, nom FROM Groupe WHERE enseignantRId = ?',
            [enseignantId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
