const pool = require('../config/db');
const Rapport = require('../models/rapportModel');
const Tache = require('../models/tacheModel');
const VersionRapport = require('../models/VersionRapportModel');

class RapportController {
    async deposerRapport(req, res) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const { idTache, titre, description, lien, idEtudiant } = req.body;

            if (!idTache || !titre || !description || !lien || !idEtudiant) {
                return res.status(400).json({
                    success: false,
                    message: 'Tous les champs sont obligatoires'
                });
            }

            if (!lien.includes('drive.google.com')) {
                return res.status(400).json({
                    success: false,
                    message: 'Veuillez fournir un lien Google Drive valide'
                });
            }

            // Récupérer binôme
            const [binome] = await connection.query(
                'SELECT idB FROM Etudiant WHERE idU = ?',
                [idEtudiant]
            );
            if (binome.length === 0) throw new Error('Étudiant non trouvé');

            const idB = binome[0].idB;

            // Créer les objets
            const rapportModel = new Rapport(connection);
            const tacheModel = new Tache(connection);
            const versionModel = new VersionRapport(connection);

            // Créer rapport
            const idR = await rapportModel.create(titre, idB);
            await rapportModel.createRapportTache(idR);

            // Lier tâche au rapport
            await tacheModel.linkToRapport(idTache, idR);

            // Ajouter la version
            await versionModel.create(description, lien, idR);

            await connection.commit();
            res.json({
                success: true,
                message: 'Rapport déposé avec succès',
                idR
            });
        } catch (error) {
            await connection.rollback();
            console.error('Erreur RapportController:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur serveur'
            });
        } finally {
            connection.release();
        }
    }
}

module.exports = RapportController;
