const db = require('../config/db');

const presenceController = {
    enregistrerPresences: (req, res) => {
        const { presences } = req.body;
        let connection;
        let responseSent = false;

        // Validation des données
        if (!Array.isArray(presences)) {
            return res.status(400).json({
                success: false,
                message: 'Format de données invalide'
            });
        }

        db.mainDb.getConnection((err, conn) => {
            if (err) {
                console.error('Erreur de connexion:', err);
                if (!responseSent) {
                    responseSent = true;
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur de connexion à la base de données'
                    });
                }
                return;
            }

            connection = conn;
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    if (!responseSent) {
                        responseSent = true;
                        return res.status(500).json({
                            success: false,
                            message: 'Erreur début transaction'
                        });
                    }
                    return;
                }

                let processed = 0;
                let hasError = false;

                const finalize = () => {
                    if (hasError || responseSent) return;

                    if (processed === presences.length) {
                        connection.commit(err => {
                            if (err) {
                                console.error('Erreur commit:', err);
                                connection.rollback(() => {
                                    connection.release();
                                    if (!responseSent) {
                                        responseSent = true;
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Erreur lors de la validation'
                                        });
                                    }
                                });
                                return;
                            }

                            connection.release();
                            if (!responseSent) {
                                responseSent = true;
                                return res.json({
                                    success: true,
                                    message: `${presences.length} présences enregistrées`
                                });
                            }
                        });
                    }
                };

                if (presences.length === 0) {
                    return finalize();
                }

                presences.forEach(presence => {
                    if (hasError || responseSent) return;

                    const { matricule, date, presence: etatPresence } = presence;
                    const etat = etatPresence === 'present' ? 'présent' : 'absent';

                    // 1. Trouver l'étudiant avec jointure sur Utilisateur
                    connection.query(
                        `SELECT e.idU 
                         FROM Etudiant e
                         JOIN Utilisateur u ON e.idU = u.idU
                         WHERE e.matricule = ? OR CONCAT(u.nom, ' ', u.prenom) = ?`,
                        [matricule, matricule],
                        (err, etudiants) => {
                            if (err || !etudiants.length) {
                                hasError = true;
                                connection.rollback(() => {
                                    connection.release();
                                    if (!responseSent) {
                                        responseSent = true;
                                        return res.status(404).json({
                                            success: false,
                                            message: `Étudiant ${matricule} non trouvé`,
                                            details: err?.message
                                        });
                                    }
                                });
                                return;
                            }

                            const etudiantId = etudiants[0].idU;

                            // 2. Gestion de la date
                            connection.query(
                                'SELECT idDP FROM DatePresence WHERE date = ?',
                                [date],
                                (err, dates) => {
                                    if (err) {
                                        hasError = true;
                                        connection.rollback(() => {
                                            connection.release();
                                            if (!responseSent) {
                                                responseSent = true;
                                                return res.status(500).json({
                                                    success: false,
                                                    message: 'Erreur recherche date'
                                                });
                                            }
                                        });
                                        return;
                                    }

                                    const handleDate = (dateId) => {
                                        if (!dateId) {
                                            connection.query(
                                                'INSERT INTO DatePresence (date) VALUES (?)',
                                                [date],
                                                (err, result) => {
                                                    if (err) {
                                                        hasError = true;
                                                        connection.rollback(() => {
                                                            connection.release();
                                                            if (!responseSent) {
                                                                responseSent = true;
                                                                return res.status(500).json({
                                                                    success: false,
                                                                    message: 'Erreur création date'
                                                                });
                                                            }
                                                        });
                                                        return;
                                                    }
                                                    insertPresence(result.insertId);
                                                }
                                            );
                                        } else {
                                            insertPresence(dateId);
                                        }
                                    };

                                    const insertPresence = (dateId) => {
                                        connection.query(
                                            `INSERT INTO Presence (idDP, etudiantId, etat)
                                             VALUES (?, ?, ?)
                                             ON DUPLICATE KEY UPDATE etat = VALUES(etat)`,
                                            [dateId, etudiantId, etat],
                                            (err) => {
                                                if (err) {
                                                    hasError = true;
                                                    connection.rollback(() => {
                                                        connection.release();
                                                        if (!responseSent) {
                                                            responseSent = true;
                                                            return res.status(500).json({
                                                                success: false,
                                                                message: 'Erreur enregistrement présence'
                                                            });
                                                        }
                                                    });
                                                    return;
                                                }

                                                processed++;
                                                finalize();
                                            }
                                        );
                                    };

                                    handleDate(dates.length ? dates[0].idDP : null);
                                }
                            );
                        }
                    );
                });
            });
        });
    },

    getPresencesByGroupe: (req, res) => {
        const { groupeId } = req.params;

        db.mainDb.query(
            `SELECT e.matricule, u.nom, u.prenom, dp.date, p.etat
             FROM Presence p
             JOIN DatePresence dp ON p.idDP = dp.idDP
             JOIN Etudiant e ON p.etudiantId = e.idU
             JOIN Utilisateur u ON e.idU = u.idU
             JOIN Binome b ON e.idB = b.idB
             WHERE b.idG = ?
             ORDER BY dp.date DESC, u.nom ASC`,
            [groupeId],
            (err, results) => {
                if (err) {
                    console.error('Erreur récupération présences:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur lors de la récupération'
                    });
                }

                res.json({
                    success: true,
                    data: results
                });
            }
        );
    }
};

module.exports = presenceController;