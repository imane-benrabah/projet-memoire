const db = require('../config/db');
const mainDb = db.mainDb;

exports.creerReunion = (req, res) => {
    console.log('Body reçu:', req.body); // Ajout pour debug
    
    const { titre, dateReunion, lieuReunion, remarqueReunion, groupe, enseignantRId } = req.body;
    // Validation du format datetime (optionnel)
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateReunion)) {
        return res.status(400).json({
            success: false,
            message: 'Format de date invalide (attendu: YYYY-MM-DD HH:MM:SS)'
        });
    }

    if (!titre || !dateReunion || !lieuReunion || !groupe || !enseignantRId) {
        console.log('Champs manquants:', { // Ajout pour debug
            titre, dateReunion, lieuReunion, groupe, enseignantRId
        });
        return res.status(400).json({ 
            success: false, 
            message: 'Tous les champs sont requis' 
        });
    }

    mainDb.query(
        `INSERT INTO Reunion 
        (titre, dateDebut, lien, remarque, idG, enseignantRId) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [titre, dateReunion, lieuReunion, remarqueReunion, groupe, enseignantRId],
        (error, results) => {
            if (error) {
                console.error('Erreur SQL:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erreur de base de données',
                    error: error.message // Ajout du message d'erreur SQL
                });
            }
            
            res.json({ 
                success: true,
                message: 'Réunion créée avec succès',
                reunionId: results.insertId
            });
        }
    );
};