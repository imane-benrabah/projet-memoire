const db = require('../config/db');

class Tache {
    // Récupérer toutes les tâches d'un étudiant via son ID
    static getTachesByEtudiantId(idEtudiant, callback) {
        const query = `
            SELECT t.idTache, t.nom, t.dateDebut, t.dateFin, e.nom AS nomEtape
            FROM Etudiant et
            JOIN Binome b ON et.idB = b.idB
            JOIN Groupe g ON b.idG = g.idG
            JOIN Sujet s ON g.idS = s.idS
            JOIN Etape e ON s.idS = e.idS
            JOIN Tache t ON e.idEtape = t.idEtape
            WHERE et.idU = ?
            ORDER BY e.nom, t.nom
        `;
        
        db.mainDb.query(query, [idEtudiant], (err, results) => {
            if (err) {
                console.error("Erreur SQL lors de la récupération des tâches:", err);
                return callback(err);
            }
            callback(null, results);
        });
    }
    
    // Vérifier si une tâche appartient à l'étudiant avant de permettre le dépôt
    static verifierTacheEtudiant(idTache, idEtudiant, callback) {
        const query = `
            SELECT COUNT(*) AS appartient, s.idS
            FROM Etudiant et
            JOIN Binome b ON et.idB = b.idB
            JOIN Groupe g ON b.idG = g.idG
            JOIN Sujet s ON g.idS = s.idS
            JOIN Etape e ON s.idS = e.idS
            JOIN Tache t ON e.idEtape = t.idEtape
            WHERE et.idU = ? AND t.idTache = ?
        `;
        
        db.mainDb.query(query, [idEtudiant, idTache], (err, results) => {
            if (err) return callback(err);
            if (results[0].appartient === 0) return callback(null, false, null);
            callback(null, true, results[0].idS);
        });
    }
    
    
    // Récupérer l'ID du binôme associé à l'étudiant
    static getBinomeIdByEtudiantId(idEtudiant, callback) {
        const query = `SELECT idB FROM Etudiant WHERE idU = ?`;
        
        db.mainDb.query(query, [idEtudiant], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(new Error("Étudiant non trouvé"));
            callback(null, results[0].idB);
        });
    }
    
    // Déposer un rapport pour une tâche
    static deposerRapport(rapportData, callback) {
        // Vérifier d'abord si l'étudiant a accès à cette tâche
        this.verifierTacheEtudiant(rapportData.idTache, rapportData.idEtudiant, (err, estAutorise, idSujet) => {
            if (err) return callback(err);
            if (!estAutorise) return callback(new Error("Vous n'êtes pas autorisé à déposer un rapport pour cette tâche"));
            
            // Récupérer l'ID du binôme de l'étudiant
            this.getBinomeIdByEtudiantId(rapportData.idEtudiant, (err, idBinome) => {
                if (err) return callback(err);
                if (!idBinome) return callback(new Error("Vous devez être assigné à un binôme pour déposer un rapport"));
                
                // Utiliser une transaction pour garantir l'intégrité des données
                db.mainDb.getConnection((err, connection) => {
                    if (err) return callback(err);
                    
                    connection.beginTransaction(err => {
                        if (err) {
                            connection.release();
                            return callback(err);
                        }
                        
                        // 1. Insérer le rapport principal avec idS
                        connection.query(
                            `INSERT INTO Rapport (titre, createdAt, idB, idS) VALUES (?, NOW(), ?, ?)`,
                            [rapportData.titre, idBinome, idSujet],
                            (err, resultRapport) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(err);
                                    });
                                }
                                
                                const idRapport = resultRapport.insertId;
                                
                                // 2. Insérer dans RapportTâches
                                connection.query(
                                    `INSERT INTO RapportTâches (idR) VALUES (?)`,
                                    [idRapport],
                                    (err) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                callback(err);
                                            });
                                        }
                                        
                                        // 3. Mettre à jour la tâche avec l'ID du rapport
                                        connection.query(
                                            `UPDATE Tache SET idR = ? WHERE idTache = ?`,
                                            [idRapport, rapportData.idTache],
                                            (err) => {
                                                if (err) {
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        callback(err);
                                                    });
                                                }
                                                
                                                // 4. Créer une version de rapport
                                                connection.query(
                                                    `INSERT INTO VersionRapport (description, lien, updatedAt, idR) 
                                                     VALUES (?, ?, NOW(), ?)`,
                                                    [rapportData.description, rapportData.lien, idRapport],
                                                    (err) => {
                                                        if (err) {
                                                            return connection.rollback(() => {
                                                                connection.release();
                                                                callback(err);
                                                            });
                                                        }
                                                        
                                                        // Valider la transaction
                                                        connection.commit(err => {
                                                            if (err) {
                                                                return connection.rollback(() => {
                                                                    connection.release();
                                                                    callback(err);
                                                                });
                                                            }
                                                            
                                                            connection.release();
                                                            callback(null, {
                                                                success: true,
                                                                idRapport: idRapport
                                                            });
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    });
                });
            });
        });
    }
}

module.exports = Tache;