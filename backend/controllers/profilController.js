const pool = require('../config/db'); // connexion à ta base MySQL

exports.getProfil = async (req, res) => {
    try {
        const idC = 1; // ID du compte à tester

        if (!idC) {
            return res.status(401).json({ error: "Non autorisé" });
        }

        // Obtenir les infos utilisateur
        const [utilisateurRows] = await pool.query(`
            SELECT u.nom, u.prenom, u.image, u.bio, u.sexe, u.dateNaissance, c.email, u.idU
            FROM Utilisateur u
            JOIN Compte c ON u.idC = c.idC
            WHERE u.idC = ?
        `, [idC]);

        if (utilisateurRows.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const utilisateur = utilisateurRows[0];

        // Déterminer le rôle
        let role = "Utilisateur";
        const [adminRows] = await pool.query(`SELECT * FROM Administrateur WHERE idU = ?`, [utilisateur.idU]);
        const [ensRows] = await pool.query(`SELECT * FROM Enseignant WHERE idU = ?`, [utilisateur.idU]);
        const [respRows] = await pool.query(`SELECT * FROM EnseignantResponsable WHERE idU = ?`, [utilisateur.idU]);
        const [principalRows] = await pool.query(`SELECT * FROM EnseignantPrincipal WHERE idU = ?`, [utilisateur.idU]);

        if (adminRows.length > 0) {
            role = "Administrateur";
        } else if (principalRows.length > 0) {
            role = "Enseignant principal";
        } else if (respRows.length > 0) {
            role = "Enseignant responsable";
        } else if (ensRows.length > 0) {
            role = "Enseignant";
        }

        // Envoyer la réponse
        res.json({
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            image: utilisateur.image,
            bio: utilisateur.bio,
            sexe: utilisateur.sexe,
            dateNaissance: utilisateur.dateNaissance,
            role
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
