// affectationController.js
const db = require('../config/db');
const mainDb = db.mainDb;

exports.affecterEnseignant = async (req, res) => {
    try {
        const { groupeId, enseignantRId } = req.body;

        // Vérification des existences
        const [groupe] = await mainDb.query('SELECT idG FROM Groupe WHERE idG = ?', [groupeId]);
        const [enseignant] = await mainDb.query(
            'SELECT idU FROM EnseignantResponsable WHERE idU = ?', 
            [enseignantRId]
        );

        if (!groupe.length || !enseignant.length) {
            return res.status(404).json({ 
                success: false,
                message: "Groupe ou enseignant introuvable" 
            });
        }

        // Mise à jour du groupe
        await mainDb.query(
            'UPDATE Groupe SET enseignantRId = ? WHERE idG = ?',
            [enseignantRId, groupeId]
        );

        res.json({ 
            success: true,
            message: "Enseignant affecté avec succès" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: "Erreur serveur" 
        });
    }
};

exports.listerGroupesSansEnseignant = async (req, res) => {
    try {
        const [results] = await mainDb.query(
            'SELECT idG, nom FROM Groupe WHERE enseignantRId IS NULL'
        );
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};