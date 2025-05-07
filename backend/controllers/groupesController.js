const db = require('../config/db');
const mainDb = db.mainDb;
const externalDb = db.externalDb;

// Création du compte étudiant avec insertion dans Compte, Utilisateur puis Etudiant (avec idB)
function creerCompteEtudiant(matricule, nom, prenom, email, idB, callback) {
    const motDePasse = matricule; // Pour dev : mot de passe = matricule

    // Étape 1 : Créer le compte dans la table Compte
    mainDb.query(
        `INSERT INTO Compte (email, password) VALUES (?, ?)`,
        [email, motDePasse],
        (err, result) => {
            if (err) return callback(err);
            const idC = result.insertId;

            // Étape 2 : Créer l'utilisateur dans Utilisateur
            mainDb.query(
                `INSERT INTO Utilisateur (nom, prenom, idC) VALUES (?, ?, ?)`,
                [nom, prenom, idC],
                (err, result) => {
                    if (err) return callback(err);
                    const idU = result.insertId;

                    // Étape 3 : Créer l'étudiant avec idB
                    mainDb.query(
                        `INSERT INTO Etudiant (idU, matricule, idB) VALUES (?, ?, ?)`,
                        [idU, matricule, idB],
                        (err) => {
                            if (err) return callback(err);
                            callback(null);
                        }
                    );
                }
            );
        }
    );
}

exports.creerGroupe = (req, res) => {
    const { binomeId, groupeNom } = req.body;
    const enseignantPrincipalId = req.headers['x-user-id'];

    const creerGroupeAvecVerifications = (callback) => {
        // Vérifier si l'utilisateur est enseignant principal
        mainDb.query(
            `SELECT idU FROM EnseignantPrincipal WHERE idU = ?`,
            [enseignantPrincipalId],
            (err, result) => {
                if (err) return callback(err);
                if (!result.length)
                    return callback(new Error("Action réservée aux enseignants principaux"));

                // Récupérer binôme de la base externe
                externalDb.query(
                    `SELECT * FROM BinomeExterne WHERE idBinome = ?`,
                    [binomeId],
                    (err, binomeExterne) => {
                        if (err) return callback(err);
                        if (!binomeExterne.length)
                            return callback(new Error("Binôme non trouvé"));

                        const binome = binomeExterne[0];

                        // Vérifier si au moins un étudiant est valide
                        const etudiant1Valide = binome.matricule1 && binome.nom1 && binome.prenom1 && binome.email1;
                        const etudiant2Valide = binome.matricule2 && binome.nom2 && binome.prenom2 && binome.email2;

                        if (!etudiant1Valide && !etudiant2Valide) {
                            return callback(new Error("Le binôme doit contenir au moins un étudiant valide"));
                        }

                        // Vérifier si le groupe existe déjà
                        mainDb.query(
                            `SELECT idG FROM Groupe WHERE nom = ?`,
                            [groupeNom],
                            (err, resultGroupe) => {
                                if (err) return callback(err);

                                const continuerAvecIdGroupe = (idG) => {
                                    // Vérifier si le binôme existe déjà
                                    mainDb.query(
                                        `SELECT * FROM Binome WHERE idB = ?`,
                                        [binomeId],
                                        (err, resultBinome) => {
                                            if (err) return callback(err);
                                            if (resultBinome.length)
                                                return callback(new Error("Ce binôme est déjà affecté à un groupe"));

                                            // Créer le binôme
                                            mainDb.query(
                                                `INSERT INTO Binome (idB, idG) VALUES (?, ?)`,

                                                [binomeId, idG],
                                                (err) => {
                                                    if (err) return callback(err);

                                                    // Créer les étudiants avec idB si valides
                                                    if (etudiant1Valide) {
                                                        creerCompteEtudiant(
                                                            binome.matricule1, binome.nom1, binome.prenom1, binome.email1, binomeId,
                                                            (err) => {
                                                                if (err) return callback(err);

                                                                // Si le deuxième étudiant est valide, créer son compte aussi
                                                                if (etudiant2Valide) {
                                                                    creerCompteEtudiant(
                                                                        binome.matricule2, binome.nom2, binome.prenom2, binome.email2, binomeId,
                                                                        (err) => {
                                                                            if (err) return callback(err);
                                                                            callback(null, idG);
                                                                        }
                                                                    );
                                                                } else {
                                                                    callback(null, idG); // Fin du processus si 1 seul étudiant
                                                                }
                                                            }
                                                        );
                                                    } else if (etudiant2Valide) {
                                                        // Si seulement l'étudiant 2 est valide, le créer
                                                        creerCompteEtudiant(
                                                            binome.matricule2, binome.nom2, binome.prenom2, binome.email2, binomeId,
                                                            (err) => {
                                                                if (err) return callback(err);
                                                                callback(null, idG);
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    );
                                };

                                // Si le groupe existe déjà
                                if (resultGroupe.length) {
                                    continuerAvecIdGroupe(resultGroupe[0].idG);
                                } else {
                                    // Sinon, créer le groupe
                                    mainDb.query(
                                        `INSERT INTO Groupe (nom) VALUES (?)`,
                                        [groupeNom],
                                        (err, result) => {
                                            if (err) return callback(err);
                                            continuerAvecIdGroupe(result.insertId);
                                        }
                                    );
                                }
                            }
                        );
                    }
                );
            }
        );
    };

    // Appel principal
    creerGroupeAvecVerifications((err, groupeId) => {
        if (err) {
            console.error(err.message);
            const status = err.message.includes("réservée") ? 403 :
                err.message.includes("trouvé") ? 404 :
                err.message.includes("valide") ? 400 :
                err.message.includes("déjà") ? 409 : 500;

            return res.status(status).json({
                success: false,
                message: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: " Binome associé avec succès",
            groupeId: groupeId
        });
    });
};

