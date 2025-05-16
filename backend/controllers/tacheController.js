const Tache = require('../models/tacheModel');

exports.getTachesByEtudiant = (req, res) => {
    const idEtudiant = req.params.idEtudiant;
    
    if (!idEtudiant) {
        return res.status(400).json({
            success: false,
            message: "L'ID de l'étudiant est requis"
        });
    }
    
    Tache.getTachesByEtudiantId(idEtudiant, (err, taches) => {
        if (err) {
            console.error("Erreur lors de la récupération des tâches:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des tâches",
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        
        // Retourner les tâches avec un format cohérent
        res.json({
            success: true,
            taches: taches.map(tache => ({
                idTache: tache.idTache,
                nom: tache.nom,
                dateDebut: tache.dateDebut ? new Date(tache.dateDebut).toISOString().split('T')[0] : null,
                dateFin: tache.dateFin ? new Date(tache.dateFin).toISOString().split('T')[0] : null,
                nomEtape: tache.nomEtape
            }))
        });
    });
};

exports.deposerRapport = (req, res) => {
    const { titre, description, lien, idTache, idEtudiant } = req.body;
    
    // Validation des données
    if (!titre || !description || !lien || !idTache || !idEtudiant) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires"
        });
    }
    
    // Validation du format de lien Google Drive (simple)
    if (!lien.includes('drive.google.com')) {
        return res.status(400).json({
            success: false,
            message: "Le lien doit être un lien Google Drive valide"
        });
    }
    
    // Déposer le rapport
    Tache.deposerRapport({
        titre,
        description,
        lien,
        idTache,
        idEtudiant
    }, (err, result) => {
        if (err) {
            console.error("Erreur lors du dépôt du rapport:", err);
            
            // Erreur personnalisée pour une meilleure expérience utilisateur
            if (err.message.includes("autorisé") || err.message.includes("binôme")) {
                return res.status(403).json({
                    success: false,
                    message: err.message
                });
            }
            
            return res.status(500).json({
                success: false,
                message: "Erreur lors du dépôt du rapport",
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        
        res.status(201).json({
            success: true,
            message: "Rapport déposé avec succès",
            idRapport: result.idRapport
        });
    });
};
