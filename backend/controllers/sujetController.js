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
    mainDb.query(
        "SELECT idS, titre FROM Sujet",
        (err, results) => {
            if (err) {
                console.error("Erreur récupération des sujets :", err);
                return res.status(500).json({ error: "Erreur serveur" });
            }
            res.status(200).json(results);
        }
    );
};
exports.getSujetById = (req, res) => {
    const idS = req.params.id;

    if (isNaN(idS)) {
        return res.status(400).json({ error: "ID sujet invalide" });
    }

    mainDb.query(
        'SELECT * FROM Sujet WHERE idS = ?',
        [idS],
        (err, results) => {
            if (err) {
                console.error("Erreur récupération sujet :", err);
                return res.status(500).json({ error: "Erreur serveur" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Sujet non trouvé" });
            }

            // Récupération des références
            mainDb.query(
                'SELECT reference FROM RefrencesSujet WHERE idS = ?',
                [idS],
                (err, refResults) => {
                    let references = [];
                    if (!err && refResults) {
                        references = refResults.map(r => r.reference);
                    } else if (err) {
                        console.error("Erreur récupération références:", err);
                    }

                    // Récupération des prérequis
                    mainDb.query(
                        'SELECT prerequis FROM PrerequisSujet WHERE idS = ?',
                        [idS],
                        (err, preResults) => {
                            let prerequis = [];
                            if (!err && preResults) {
                                prerequis = preResults.map(p => p.prerequis);
                            } else if (err) {
                                console.error("Erreur récupération prérequis:", err);
                            }

                            const response = {
                                ...results[0],
                                references: references,
                                prerequis: prerequis
                            };

                            res.status(200).json(response);
                        }
                    );
                }
            );
        }
    );
};

exports.getSujetByEtudiantId = (req, res) => {
    const idEtudiant = req.params.id;
    
    if (isNaN(idEtudiant)) {
        return res.status(400).json({ error: "ID étudiant invalide" });
    }

    mainDb.query(
        `SELECT s.* 
         FROM Sujet s
         JOIN Groupe g ON s.idS = g.idS
         JOIN Binome b ON g.idG = b.idG
         JOIN Etudiant e ON b.idB = e.idB
         WHERE e.idU = ?`,
        [idEtudiant],
        (err, sujetResults) => {
            if (err) {
                console.error("Erreur récupération sujet:", err);
                return res.status(500).json({ error: "Erreur serveur" });
            }
            
            if (sujetResults.length === 0) {
                return res.status(404).json({ error: "Aucun sujet trouvé pour cet étudiant" });
            }

            const sujet = sujetResults[0];
            const idS = sujet.idS;

            mainDb.query(
                'SELECT reference FROM RefrencesSujet WHERE idS = ?',
                [idS],
                (err, refResults) => {
                    let references = [];
                    if (!err && refResults) {
                        references = refResults.map(r => r.reference);
                    } else if (err) {
                        console.error("Erreur récupération références:", err);
                    }

                    mainDb.query(
                        'SELECT prerequis FROM PrerequisSujet WHERE idS = ?',
                        [idS],
                        (err, preResults) => {
                            let prerequis = [];
                            if (!err && preResults) {
                                prerequis = preResults.map(p => p.prerequis);
                            } else if (err) {
                                console.error("Erreur récupération prérequis:", err);
                            }

                            const response = {
                                ...sujet,
                                references: references,
                                prerequis: prerequis
                            };

                            res.status(200).json(response);
                        }
                    );
                }
            );
        }
    );
};

// Nouvelles fonctions pour récupérer les références et prérequis par ID de sujet
exports.getReferencesBySujetId = (req, res) => {
    const idS = req.params.id;
    
    if (isNaN(idS)) {
        return res.status(400).json({ error: "ID sujet invalide" });
    }
    
    mainDb.query(
        'SELECT reference FROM RefrencesSujet WHERE idS = ?',
        [idS],
        (err, results) => {
            if (err) {
                console.error("Erreur récupération références:", err);
                return res.status(500).json({ error: "Erreur serveur" });
            }
            
            const references = results.map(r => r.reference);
            res.status(200).json(references);
        }
    );
};

exports.getPrerequisBySujetId = (req, res) => {
    const idS = req.params.id;
    
    if (isNaN(idS)) {
        return res.status(400).json({ error: "ID sujet invalide" });
    }
    
    mainDb.query(
        'SELECT prerequis FROM PrerequisSujet WHERE idS = ?',
        [idS],
        (err, results) => {
            if (err) {
                console.error("Erreur récupération prérequis:", err);
                return res.status(500).json({ error: "Erreur serveur" });
            }
            
            const prerequis = results.map(p => p.prerequis);
            res.status(200).json(prerequis);
        }
    );
};