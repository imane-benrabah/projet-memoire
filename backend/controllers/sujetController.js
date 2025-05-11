const Sujet = require('../models/sujetModel');

const { mainDb } = require('../config/db');

exports.ajouterSujet = (req, res) => {
    const { titre, description, enseignantRId, references, prerequis } = req.body;

    // Validation des données requises
    if (!titre || !description || !enseignantRId) {
        return res.status(400).json({ 
            message: "Titre, description et ID enseignant sont requis." 
        });
    }

    // Vérification que l'enseignantRId est un nombre valide
    if (isNaN(enseignantRId)) {
        return res.status(400).json({ 
            message: "ID enseignant invalide." 
        });
    }

    // Étape 1 : Insertion dans Sujet
    mainDb.query(
        'INSERT INTO Sujet (titre, description, enseignantRId) VALUES (?, ?, ?)',
        [titre, description, enseignantRId],
        (err, result) => {
            if (err) {
                console.error("Erreur insertion Sujet :", err);
                return res.status(500).json({ 
                    message: "Erreur lors de l'ajout du sujet.",
                    error: err.message 
                });
            }

            const idS = result.insertId;

            // Fonction pour insérer les références
            const insererReferences = (callback) => {
                if (references && references.length > 0) {
                    let completed = 0;
                    let hasError = false;
                    
                    references.forEach(ref => {
                        mainDb.query(
                            'INSERT INTO RefrencesSujet (reference, idS) VALUES (?, ?)',
                            [ref, idS],
                            (err) => {
                                if (err && !hasError) {
                                    hasError = true;
                                    console.error("Erreur insertion référence :", err);
                                    return callback(err);
                                }
                                completed++;
                                if (completed === references.length && !hasError) {
                                    callback(null);
                                }
                            }
                        );
                    });
                } else {
                    callback(null);
                }
            };

            // Fonction pour insérer les prérequis
            const insererPrerequis = (callback) => {
                if (prerequis && prerequis.length > 0) {
                    let completed = 0;
                    let hasError = false;
                    
                    prerequis.forEach(pre => {
                        mainDb.query(
                            'INSERT INTO PrerequisSujet (prerequis, idS) VALUES (?, ?)',
                            [pre, idS],
                            (err) => {
                                if (err && !hasError) {
                                    hasError = true;
                                    console.error("Erreur insertion prérequis :", err);
                                    return callback(err);
                                }
                                completed++;
                                if (completed === prerequis.length && !hasError) {
                                    callback(null);
                                }
                            }
                        );
                    });
                } else {
                    callback(null);
                }
            };

            // Exécution en série pour mieux gérer les erreurs
            insererReferences((err) => {
                if (err) {
                    return res.status(500).json({ 
                        message: "Erreur lors de l'ajout des références.",
                        error: err.message 
                    });
                }
                
                insererPrerequis((err) => {
                    if (err) {
                        return res.status(500).json({ 
                            message: "Erreur lors de l'ajout des prérequis.",
                            error: err.message 
                        });
                    }
                    
                    return res.status(200).json({ 
                        message: "Sujet ajouté avec succès !",
                        idS: idS
                    });
                });
            });
        }
    );
};

// controllers/sujetController.js

exports.getSujetsByResponsable = (req, res) => {
    const idResponsable = req.params.id;

    mainDb.query(
        `SELECT DISTINCT s.idS, s.titre, s.description
         FROM Sujet s
         INNER JOIN Groupe g ON s.idS = g.idS
         WHERE g.enseignantRId = ?`,
        [idResponsable],
        (err, results) => {
            if (err) {
                console.error("Erreur récupération des sujets :", err);
                return res.status(500).json({ error: "Erreur serveur" });
            }

            res.json(results);
        }
    );
};





exports.getAllSujets = (req, res) => {
    const sql = "SELECT idS, titre FROM Sujet";
    mainDb.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des sujets :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
    });
};







    exports.getSujetById = async (req, res) => {
        try {
            const sujet = await Sujet.findById(req.params.id);
            if (!sujet) {
                return res.status(404).json({ message: 'Sujet non trouvé' });
            }
            res.json(sujet);
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error });
        }
    };