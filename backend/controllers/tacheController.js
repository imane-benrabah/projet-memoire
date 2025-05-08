// backend/controllers/tacheController.js

const tachemodel = require('../models/tacheModel');

// Fonction pour récupérer les tâches par étape
const getTachesByEtape = (req, res) => {
    const id_etape = req.params.id_etape;

    tachemodel.getTachesByEtape(id_etape, (err, taches) => {
        if (err) {
            console.error('Erreur lors de la récupération des tâches:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(taches);
    });
};

module.exports = {
    getTachesByEtape
};

