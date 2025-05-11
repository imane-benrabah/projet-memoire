const db = require('../config/db');
const mainDb = db.mainDb;

exports.ajouterEtapes = (req, res) => {
    const { etapes, idS, enseignantRId } = req.body;

    if (!Array.isArray(etapes) || !idS || !enseignantRId) {
        return res.status(400).json({ 
            message: "Données manquantes",
            received: { etapes, idS, enseignantRId }
        });
    }

    console.log('Données reçues:', {
        etapes: etapes.map(e => ({
            nom: e.nom,
            dateDebut: e.dateDebut,
            dateFin: e.dateFin,
            tachesCount: e.taches?.length || 0
        })),
        idS,
        enseignantRId
    });

    let etapesCompleted = 0;
    let totalEtapes = etapes.length;
    let hasResponded = false;

    etapes.forEach(etape => {
        const { nom, dateDebut, dateFin, taches } = etape;

        const insertEtapeQuery = `
            INSERT INTO Etape (nom, dateDebut, dateFin, idS) 
            VALUES (?, ?, ?, ?)
        `;

        mainDb.query(insertEtapeQuery, [nom, dateDebut, dateFin, idS], (err, result) => {
            if (err) {
                if (!hasResponded) {
                    hasResponded = true;
                    console.error('Erreur insertion étape :', err);
                    return res.status(500).json({ message: "Erreur lors de l'insertion d'une étape" });
                }
                return;
            }

            const idEtape = result.insertId;

            if (Array.isArray(taches) && taches.length > 0) {
                let tachesCompleted = 0;
                let totalTaches = taches.length;

                taches.forEach(tache => {
                    const { nom, dateDebut, dateFin } = tache;
                    const insertTacheQuery = `
                        INSERT INTO Tache (nom, dateDebut, dateFin, idEtape)
                        VALUES (?, ?, ?, ?)
                    `;

                    mainDb.query(insertTacheQuery, [nom, dateDebut, dateFin, idEtape], (err2) => {
                        if (err2) {
                            if (!hasResponded) {
                                hasResponded = true;
                                console.error('Erreur insertion tâche :', err2);
                                return res.status(500).json({ message: "Erreur lors de l'insertion d'une tâche" });
                            }
                            return;
                        }

                        tachesCompleted++;

                        if (tachesCompleted === totalTaches) {
                            etapesCompleted++;
                            if (etapesCompleted === totalEtapes && !hasResponded) {
                                hasResponded = true;
                                return res.status(200).json({ message: "Étapes et tâches enregistrées avec succès" });
                            }
                        }
                    });
                });
            } else {
                // Aucune tâche à ajouter
                etapesCompleted++;
                if (etapesCompleted === totalEtapes && !hasResponded) {
                    hasResponded = true;
                    return res.status(200).json({ message: "Étapes enregistrées avec succès (sans tâches)" });
                }
            }
        });
    });
};
