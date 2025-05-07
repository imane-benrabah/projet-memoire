// controllers/tacheController.js

const etapesModel = require('../models/tachemodel');

// دالة getAllEtapes
const getAllEtapes = (req, res) => {
    etapesModel.getAllEtapes((err, tache) => {
        if (err) {
            console.error('Erreur lors de la récupération des taches:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(tache);
    });
};

module.exports = {
    getAllEtapes
};
