const express = require('express');
const router = express.Router();
const RapportController = require('../controllers/rapportController');

// Middleware pour valider l'ID étudiant
const validateStudentId = (req, res, next) => {
    const idEtudiant = req.params.idEtudiant || req.body.idEtudiant;
    if (!idEtudiant || isNaN(idEtudiant)) {
        return res.status(400).json({
            success: false,
            message: 'ID étudiant manquant ou invalide'
        });
    }
    next();
};

// Route pour récupérer les tâches d'un étudiant
router.get('/api/etudiants/:idEtudiant/taches',
    validateStudentId,
    RapportController.getStudentTasks
);

// Route pour déposer un rapport   
router.post('/deposer', validateStudentId, RapportController.submitReport);

module.exports = router;
