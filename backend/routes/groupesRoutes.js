const express = require("express");
const router = express.Router();
const groupesController = require("../controllers/groupesController");
const { mainDb } = require("../config/db");

router.post("/", groupesController.creerGroupe);
router.get('/verifier-sujet/:idG', groupesController.verifierSujetGroupe);
router.put('/assigner-sujet', groupesController.assignerSujetAuGroupe);
router.get('/groupes-par-enseignant/:id', (req, res) => {
    const enseignantId = req.params.id;

    const sql = `SELECT idG, nom FROM Groupe WHERE enseignantRId = ?`;
    mainDb.query(sql, [enseignantId], (err, results) => {
        if (err) {
            console.error('Erreur récupération groupes:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.json(results);
    });
});


module.exports = router;
