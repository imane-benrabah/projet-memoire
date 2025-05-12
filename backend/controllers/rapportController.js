const RapportModel = require('../models/rapportModel');

// Fonction utilitaire pour valider les liens Google Drive
const isValidGoogleDriveLink = (link) => {
    try {
        const url = new URL(link);
        return url.hostname === 'drive.google.com';
    } catch (e) {
        return false;
    }
};

const RapportController = {
    // Récupère les tâches d'un étudiant
    getStudentTasks: (req, res) => {
        const idEtudiant = req.params.idEtudiant;

        if (!idEtudiant) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID étudiant manquant' 
            });
        }

        RapportModel.getTasksByStudent(idEtudiant, (err, tasks) => {
            if (err) {
                console.error('Erreur getStudentTasks:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erreur serveur',
                    error: err.message 
                });
            }
            
            if (!tasks || tasks.length === 0) {
                return res.status(404).json({ 
                    success: true, 
                    message: 'Aucune tâche disponible',
                    taches: []
                });
            }

            res.status(200).json({ 
                success: true, 
                taches: tasks 
            });
        });
    },

    // Soumet un nouveau rapport
    submitReport: (req, res) => {
        try {
            const { titre, description, lien, idTache, idEtudiant } = req.body;

            // Validation
            if (!titre || !description || !lien || !idTache || !idEtudiant) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tous les champs sont requis',
                    requiredFields: ['titre', 'description', 'lien', 'idTache', 'idEtudiant']
                });
            }

            if (!isValidGoogleDriveLink(lien)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Lien Google Drive invalide',
                    expectedFormat: 'https://drive.google.com/...'
                });
            }

            // Processus
            RapportModel.getStudentBinome(idEtudiant, (err, idB) => {
                if (err) {
                    console.error('Erreur getStudentBinome:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erreur lors de la récupération du binôme',
                        error: err.message
                    });
                }

                if (!idB) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'Binôme non trouvé pour cet étudiant' 
                    });
                }

                RapportModel.createReport(titre, idB, (err, idR) => {
                    if (err) {
                        console.error('Erreur createReport:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Erreur lors de la création du rapport',
                            error: err.message
                        });
                    }

                    RapportModel.linkReportToTask(idR, idTache, (err) => {
                        if (err) {
                            console.error('Erreur linkReportToTask:', err);
                            return res.status(500).json({ 
                                success: false, 
                                message: 'Erreur lors de la liaison du rapport à la tâche',
                                error: err.message
                            });
                        }

                        RapportModel.createReportVersion(description, lien, idR, (err, idVR) => {
                            if (err) {
                                console.error('Erreur createReportVersion:', err);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Erreur lors de la création de la version du rapport',
                                    error: err.message
                                });
                            }

                            res.status(201).json({ 
                                success: true, 
                                message: 'Rapport déposé avec succès',
                                data: {
                                    idRapport: idR,
                                    idVersion: idVR
                                }
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Erreur inattendue submitReport:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erreur serveur inattendue',
                error: error.message 
            });
        }
    }
};

module.exports = RapportController;
