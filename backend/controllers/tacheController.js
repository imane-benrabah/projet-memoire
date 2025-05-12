const pool = require('../config/db');

class TacheController {
    async getTachesEtudiant(req, res) {
        try {
            const { idEtudiant } = req.params;
            
            if (!idEtudiant) {
                return res.status(400).json({ 
                    success: false,
                    message: 'ID étudiant requis' 
                });
            }

            // 1. Récupérer le binôme de l'étudiant
            const [binome] = await pool.query(
                'SELECT idB FROM Etudiant WHERE idU = ?',
                [idEtudiant]
            );
            
            if (binome.length === 0) {
                return res.json({ success: true, data: [] });
            }
            
            // 2. Récupérer le groupe du binôme
            const [groupe] = await pool.query(
                'SELECT idG FROM Binome WHERE idB = ?',
                [binome[0].idB]
            );
            
            if (groupe.length === 0) {
                return res.json({ success: true, data: [] });
            }
            
            // 3. Récupérer le sujet du groupe
            const [sujet] = await pool.query(
                'SELECT idS FROM Groupe WHERE idG = ?',
                [groupe[0].idG]
            );
            
            if (sujet.length === 0) {
                return res.json({ success: true, data: [] });
            }
            
            // 4. Récupérer toutes les tâches pour ce sujet
            const [taches] = await pool.query(`
                SELECT t.* 
                FROM Tache t
                JOIN Etape e ON t.idEtape = e.idEtape
                WHERE e.idS = ?
                ORDER BY t.dateDebut
            `, [sujet[0].idS]);
            
            res.json({ success: true, data: taches });
        } catch (error) {
            console.error('Erreur TacheController:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erreur serveur' 
            });
        }
    }
}

module.exports = TacheController;