const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ajout de l'import db
const Binome = require("../models/Binome");
const Etudiant = require("../models/Etudiant");
const Groupe = require("../models/Groupe");

// Route pour créer un binôme
router.post("/", (req, res) => {
    Binome.create(
        req.body.etudiant1_matricule, 
        req.body.etudiant2_matricule, 
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId });
        }
    );
});

// Route unique pour GET / (avec ou sans filtre)
router.get("/", (req, res) => {
    if (req.query.group) {
        Binome.getByGroup(req.query.group.trim().toLowerCase(), (err, data) => {
            if (err) return res.status(500).json({ error: err });
            res.json(data);
        });
    } else {
        Binome.getAllWithEtudiants((err, data) => {
            if (err) return res.status(500).json({ error: err });
            res.json(data);
        });
    }
});

// Route pour associer un binôme à un groupe
router.post("/associer", (req, res) => {
    Groupe.getIdByName(req.body.groupe_nom, (err, rows) => {
        if (err || !rows.length) return res.status(404).json({ error: "Groupe non trouvé" });
        const groupeId = rows[0].id;
        Binome.associateToGroup(req.body.binome_id, groupeId, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Associé" });
        });
    });
});

module.exports = router;
