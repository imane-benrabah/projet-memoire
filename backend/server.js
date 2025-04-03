const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const router = express.Router();

const db = require('./config/db');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Servir les fichiers frontend

// Connexion à la base de données via db
db.connect((err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données :", err);
        return;
    }
    console.log("Connexion réussie à la base de données");
});

// Obtenir la liste des étudiants
app.get("/etudiants", (req, res) => {
    db.query("SELECT * FROM etudiant", (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Ajouter un étudiant
app.post("/etudiants", (req, res) => {
    const { matricule, nom, prenom } = req.body;
    db.query("INSERT INTO etudiant (matricule, nom, prenom) VALUES (?, ?, ?)", [matricule, nom, prenom], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Étudiant ajouté avec succès", matricule });
        }
    });
});

// Ajouter un binôme
app.post("/binomes", (req, res) => {
    const { etudiant1_matricule, etudiant2_matricule } = req.body;
    db.query(
        "INSERT INTO binomes (etudiant1_matricule, etudiant2_matricule) VALUES (?, ?)",
        [etudiant1_matricule, etudiant2_matricule],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: "Binôme ajouté avec succès", id: result.insertId });
            }
        }
    );
});

// Obtenir la liste des binômes avec les informations des étudiants
app.get("/binomes", (req, res) => {
    db.query(
        `SELECT 
            b.id AS binome_id, 
            e1.matricule AS etudiant1_matricule, e1.nom AS etudiant1_nom, e1.prenom AS etudiant1_prenom, 
            e2.matricule AS etudiant2_matricule, e2.nom AS etudiant2_nom, e2.prenom AS etudiant2_prenom, 
            g.nom_groupe, g.id AS groupe_id
        FROM binomes b
        LEFT JOIN etudiant e1 ON b.etudiant1_matricule = e1.matricule
        LEFT JOIN etudiant e2 ON b.etudiant2_matricule = e2.matricule
        LEFT JOIN groupe g ON b.groupe_id = g.id`,
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(results);
            }
        }
    );
});

// Récupérer les groupes
app.get('/groupes', (req, res) => {
    db.query('SELECT nom_groupe FROM groupe', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des groupes :', err);
            res.status(500).json({ error: 'Erreur serveur' });
            return;
        }
        res.json(results); // Retourne les noms des groupes
    });
});

// Route pour associer un binôme à un groupe
app.post('/associerBinomeGroupe', (req, res) => {
    const { binome_id, groupe_nom } = req.body;

    if (!binome_id || !groupe_nom) {
        return res.status(400).json({ success: false, message: "Paramètres manquants !" });
    }

    // Rechercher l'ID du groupe dans la base de données
    db.query("SELECT id FROM groupe WHERE nom_groupe = ?", [groupe_nom], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du groupe :", err);
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Groupe non trouvé" });
        }

        const groupeId = results[0].id;

        // Associer le binôme avec le groupe
        db.query("UPDATE binomes SET groupe_id = ? WHERE id = ?", [groupeId, binome_id], (err, result) => {
            if (err) {
                console.error("Erreur lors de l'association du binôme :", err);
                return res.status(500).json({ success: false, message: "Erreur lors de l'association" });
            }

            // Si l'association a été effectuée avec succès
            res.json({ success: true, message: "Binôme associé au groupe avec succès" });
        });
    });
});

// Chargement du binôme selon le groupe
app.get("/binomes", (req, res) => {
    const groupName = req.query.group; // Récupérer le paramètre "group"
    console.log("Paramètre 'group' reçu:", groupName);

    // Normalisation du groupe (enlever les espaces et convertir en minuscules)
    const normalizedGroupName = groupName.trim().toLowerCase();

    // Mise à jour de la requête SQL pour filtrer le groupe sélectionné
    const sqlQuery = `
        SELECT binomes.id AS binome_id, 
               binomes.etudiant1_matricule, 
               e1.nom AS etudiant1_nom, e1.prenom AS etudiant1_prenom,
               binomes.etudiant2_matricule, 
               e2.nom AS etudiant2_nom, e2.prenom AS etudiant2_prenom,
               groupe.nom_groupe AS nom_groupe, groupe.id AS groupe_id
        FROM binomes
        INNER JOIN groupe ON binomes.groupe_id = groupe.id
        LEFT JOIN etudiant e1 ON binomes.etudiant1_matricule = e1.matricule
        LEFT JOIN etudiant e2 ON binomes.etudiant2_matricule = e2.matricule
        WHERE LOWER(groupe.nom_groupe) = ? 
        AND (binomes.etudiant1_matricule IS NOT NULL OR binomes.etudiant2_matricule IS NOT NULL)
    `;

    db.query(sqlQuery, [normalizedGroupName], (err, result) => {
        if (err) {
            console.log("Erreur dans la requête SQL:", err);
            return res.status(500).send("Erreur serveur");
        }
    
        console.log("Résultat de la requête SQL:", result);  // Affiche les résultats dans la console
    
        res.json(result);
    });
});

// Ajouter un binôme dans la base de données
app.post("/ajouter-binome", (req, res) => {
    const { matricule1, matricule2 } = req.body;

    if (!matricule1) {
        console.error("Le matricule du premier étudiant est requis !");
        return res.status(400).json({ success: false, message: "Le matricule du premier étudiant est requis !" });
    }

    console.log("Requête pour ajouter un binôme reçue avec les matricules :", matricule1, matricule2);

    db.query(
        "SELECT matricule FROM etudiant WHERE matricule = ? OR matricule = ?",
        [matricule1, matricule2],
        (err, etudiants) => {
            if (err) {
                console.error("Erreur lors de la vérification des étudiants :", err);
                return res.status(500).json({ success: false, message: "Erreur serveur" });
            }

            console.log("Résultats de la vérification des étudiants :", etudiants);

            if (etudiants.length === 0 || (matricule2 && etudiants.length < 2)) {
                return res.status(400).json({ success: false, message: "Un ou les deux étudiants n'existent pas !" });
            }

            db.query(
                "SELECT binome_id FROM binomes WHERE etudiant1_matricule IN (?, ?) OR etudiant2_matricule IN (?, ?)",
                [matricule1, matricule2, matricule1, matricule2],
                (err, binomeCheck) => {
                    if (err) {
                        console.error("Erreur lors de la vérification du binôme :", err);
                        return res.status(500).json({ success: false, message: "Erreur serveur" });
                    }

                    console.log("Résultats de la vérification du binôme :", binomeCheck);

                    if (binomeCheck.length > 0) {
                        return res.status(400).json({ success: false, message: "Un des étudiants appartient déjà à un binôme !" });
                    }

                    db.query(
                        "INSERT INTO binomes (etudiant1_matricule, etudiant2_matricule) VALUES (?, ?)",
                        [matricule1, matricule2 || null],
                        (err, result) => {
                            if (err) {
                                console.error("Erreur lors de l'insertion du binôme :", err);
                                return res.status(500).json({ success: false, message: "Erreur serveur" });
                            }

                            console.log("Binôme ajouté avec succès");
                            res.json({ success: true, message: "Binôme ajouté avec succès !" });
                        }
                    );
                }
            );
        }
    );
});





// Route GET pour récupérer les informations d'un étudiant par son matricule
app.get('/api/etudiants/:matricule', (req, res) => {
    const { matricule } = req.params;
    console.log("Matricule reçu pour recherche:", matricule);  // Log du matricule reçu

    const sql = "SELECT * FROM etudiant WHERE matricule = ?";
    db.query(sql, [matricule], (err, result) => {
        if (err) {
            console.error("Erreur de la base de données:", err);
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }
        console.log("Résultat de la requête SQL:", result);  // Log des résultats de la requête

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Étudiant non trouvé" });
        }
        res.json(result[0]); // Renvoyer les données de l'étudiant
    });
});

// Modifier un étudiant
app.put('/api/etudiants/:matricule', (req, res) => {
    console.log("Requête reçue pour modification");

    const { matricule } = req.params;
    const { nom, prenom } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ success: false, message: "Nom et prénom requis" });
    }

    const sql = "UPDATE etudiant SET nom = ?, prenom = ? WHERE matricule = ?";
    db.query(sql, [nom, prenom, matricule], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Étudiant non trouvé" });
        }
        res.json({ success: true, message: "Étudiant mis à jour avec succès" });
    });
});

// ✅ Route DELETE pour supprimer un étudiant d’un binôme
// ✅ Route DELETE pour supprimer un étudiant d’un binôme
app.delete("/etudiants/:matricule", (req, res) => {
    const matricule = req.params.matricule;

    // 1️⃣ Mise à jour du binôme : mettre NULL si l'étudiant supprimé est dedans
    const updateBinomeQuery = `
        UPDATE binomes 
        SET etudiant1_matricule = CASE WHEN etudiant1_matricule = ? THEN NULL ELSE etudiant1_matricule END,
            etudiant2_matricule = CASE WHEN etudiant2_matricule = ? THEN NULL ELSE etudiant2_matricule END
        WHERE etudiant1_matricule = ? OR etudiant2_matricule = ?;
    `;

    db.query(updateBinomeQuery, [matricule, matricule, matricule, matricule], (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du binôme :", err);
            return res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour du binôme." });
        }

        // 2️⃣ Supprimer les binômes vides (où les deux étudiants sont NULL)
        const deleteEmptyBinomeQuery = `DELETE FROM binomes WHERE etudiant1_matricule IS NULL AND etudiant2_matricule IS NULL;`;

        db.query(deleteEmptyBinomeQuery, (err, result) => {
            if (err) {
                console.error("Erreur lors de la suppression des binômes vides :", err);
                return res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression des binômes vides." });
            }

            res.json({ success: true, message: "Étudiant supprimé avec succès et binôme mis à jour." });
        });
    });
});






module.exports = router;

app.listen(3000, () => {
    console.log("Serveur démarré sur le port 3000");
});
