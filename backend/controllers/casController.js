// controllers/casController.js
const casModel = require('../models/casModel');

exports.getCasEtudiant = (req, res) => {
    const idEtudiant = req.params.id;

    casModel.getCasByEtudiantId(idEtudiant, (err, results) => {
        if (err) {
            console.error('Erreur récupération cas :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.json(results);
    });
};
