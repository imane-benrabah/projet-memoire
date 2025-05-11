const db = require('../config/db'); // connexion MySQL

const { mainDb } = require('../config/db');

exports.getEtudiants = (req, res) => {
    const groupeId = req.params.id;
    const sql = `
     SELECT 
            e.matricule, 
            u.nom, 
            u.prenom, 
            c.email, 
            b.idB AS numero_binome
        FROM 
            Etudiant e
        JOIN 
            Utilisateur u ON e.idU = u.idU
        JOIN 
            Compte c ON u.idC = c.idC
        JOIN 
            Binome b ON e.idB = b.idB
        WHERE 
            b.idG = ?
    `;


    mainDb.query(sql, [groupeId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des étudiants :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.json(results);
    });
};




exports.updateEtudiant = (req, res) => {
    const { matricule } = req.params;
    const { nom, prenom } = req.body;

    // D'abord récupérer idU à partir du matricule
    const getUserIdQuery = `SELECT idU FROM Etudiant WHERE matricule = ?`;

    mainDb.query(getUserIdQuery, [matricule], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'étudiant :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Étudiant non trouvé' });
        }

        const idU = rows[0].idU;

        // Mise à jour du nom et prénom
        const updateUserQuery = `UPDATE Utilisateur SET nom = ?, prenom = ? WHERE idU = ?`;
        mainDb.query(updateUserQuery, [nom, prenom, idU], (err2) => {
            if (err2) {
                console.error('Erreur lors de la mise à jour :', err2);
                return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
            }

            res.json({ message: 'Étudiant mis à jour' });
        });
    });
};


exports.deleteBinome = (req, res) => {
    const numero = req.params.numero;
    const query = `DELETE FROM Binome WHERE idB = ?`;
    mainDb.query(query, [numero], (err) => {
        if (err) return res.status(500).json({ error: 'Erreur suppression' });
        res.json({ message: 'Binôme supprimé' });
    });
};
