
const db = require('../config/db');
const mainDb = db.mainDb;
const casModel = require('../models/casModel');
const binomeModel = require('../models/casbinomeModel');

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

//preciser cas
exports.enregistrerCasSujet = function(req, res) {
    const { acteurs } = req.body;
    const idS = req.params.idS;
    const idResponsable = req.query.idResponsable;

    // Validation de base
    if (!idResponsable) {
        return res.status(400).json({ error: "ID responsable manquant" });
    }

    if (!acteurs || !Array.isArray(acteurs) || acteurs.length === 0) {
        return res.status(400).json({ error: "Données invalides - aucun acteur fourni" });
    }

    // Vérifier que le responsable a accès à ce sujet
    casModel.verifyResponsableSujet(idS, idResponsable, function(err, isResponsable) {
        if (err) {
            console.error("Erreur vérification responsable:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (!isResponsable) {
            return res.status(403).json({ error: "Accès non autorisé à ce sujet" });
        }

        // Transformer la structure des données si nécessaire
        const acteursTransformes = acteurs.map(acteur => ({
            acteur: acteur.acteur,
            cas: Array.isArray(acteur.cas) ? acteur.cas : [acteur.cas]
        }));

        // Enregistrer les cas dans la base
        casModel.createCasPourSujet(idS, acteursTransformes, function(err, affectedRows) {
            if (err) {
                console.error("Erreur enregistrement:", err);
                return res.status(500).json({ error: "Erreur lors de l'enregistrement" });
            }

            res.json({ 
                message: `${affectedRows} cas enregistrés pour le sujet ${idS}`,
                sujet_id: idS
            });
        });
    });
};



//affecter cas

exports.getCasEtActeurs = function(req, res) {
    const binomeId = req.query.binome;
    
    if (!binomeId) {
        return res.status(400).json({ 
            success: false,
            message: 'Paramètre binome requis'
        });
    }

    // 1. Récupérer le sujet associé au binôme
    binomeModel.getSujetByBinome(binomeId, (err, sujet) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                success: false,
                message: 'Erreur serveur'
            });
        }

        if (!sujet) {
            return res.status(404).json({ 
                success: false,
                message: 'Aucun sujet trouvé pour ce binôme'
            });
        }

        // 2. Récupérer les acteurs et cas disponibles pour ce sujet
        casModel.getActeursBySujet(sujet.idS, (errActeurs, acteurs) => {
            if (errActeurs) {
                console.error(errActeurs);
                return res.status(500).json({ 
                    success: false,
                    message: 'Erreur lors de la récupération des acteurs'
                });
            }

            casModel.getCasBySujet(sujet.idS, (errCas, cas) => {
                if (errCas) {
                    console.error(errCas);
                    return res.status(500).json({ 
                        success: false,
                        message: 'Erreur lors de la récupération des cas'
                    });
                }

                res.json({ 
                    success: true,
                    data: {
                        sujet: sujet,
                        acteurs: acteurs,
                        cas: cas
                    }
                });
            });
        });
    });
};

exports.affecterCas = function(req, res) {
    const { binome, cas } = req.body;

    if (!binome || !cas || !Array.isArray(cas) || cas.length === 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Paramètres invalides'
        });
    }

    casModel.affecterCasAuBinome(binome, cas, (err, affectedRows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                success: false,
                message: 'Erreur lors de l\'affectation des cas'
            });
        }

        res.json({ 
            success: true,
            message: `${affectedRows} cas affectés avec succès au binôme`
        });
    });
};