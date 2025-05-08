const express = require('express');
const router = express.Router();
const etudiantinfoController = require('../controllers/etudiantinfoController');
const db = require('../config/db'); // connexion MySQL

const { mainDb } = require('../config/db');


router.get('/:id', (req, res) => {
    const groupeId = req.params.id;
    mainDb.query('SELECT * FROM Groupe WHERE idG = ?', [groupeId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        if (results.length === 0) return res.status(404).json({ error: 'Groupe non trouvé' });
        res.json(results[0]);
    });
});

// Récupérer les étudiants d’un groupe
router.get('/:id/etudiants', etudiantinfoController.getEtudiants);



// Modifier un étudiant
router.put('/etudiants/:matricule', etudiantinfoController.updateEtudiant);

// Supprimer un binôme par numéro
router.delete('/binome/:numero',etudiantinfoController.deleteBinome);

module.exports = router;
