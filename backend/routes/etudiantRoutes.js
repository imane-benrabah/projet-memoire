const express = require("express");
const router = express.Router();
const Etudiant = require("../models/Etudiant");
const Binome = require("../models/binomeExterneModel");

// Récupérer tous les étudiants
router.get("/", (req, res) => {
    Etudiant.getAll((err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// Créer un nouvel étudiant
router.post("/", (req, res) => {
    if (!req.body.matricule || !req.body.nom) {
        return res.status(400).json({ error: "Matricule et nom sont obligatoires" });
    }

    Etudiant.create(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            message: "Étudiant ajouté avec succès",
            id: result.insertId 
        });
    });
});

// Récupérer un étudiant par matricule
router.get("/:matricule", (req, res) => {
    Etudiant.getByMatricule(req.params.matricule, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!data.length) return res.status(404).json({ message: "Étudiant non trouvé" });
        res.json(data[0]);
    });
});

// Mettre à jour un étudiant
router.put("/:matricule", (req, res) => {
    Etudiant.update(req.params.matricule, req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result.affectedRows) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }
        res.json({ message: "Étudiant modifié avec succès" });
    });
});

// Supprimer un étudiant d'un binôme (votre route)
router.delete("/:matricule/binomes/:binomeId", (req, res) => {
    const { matricule, binomeId } = req.params;

    // 1. Vérifier que l'étudiant appartient bien au binôme
    Binome.studentBelongsToBinome(matricule, binomeId, (err, belongs) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!belongs) return res.status(400).json({ error: "L'étudiant n'appartient pas à ce binôme" });

        // 2. Supprimer l'étudiant du binôme
        Binome.removeStudent(binomeId, matricule, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (result.isEmpty) {
                // 3. Si le binôme est vide, le supprimer complètement
                Binome.delete(binomeId, (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ 
                        message: "Étudiant supprimé et binôme vide supprimé",
                        binomeDeleted: true
                    });
                });
            } else {
                res.json({ 
                    message: "Étudiant supprimé du binôme",
                    binomeDeleted: false
                });
            }
        });
    });
});

router.put('/:matricule', async (req, res) => {
    const { matricule } = req.params;
    const { nom, prenom } = req.body;

    try {
        const [result] = await db.execute(
            'UPDATE etudiants SET nom = ?, prenom = ? WHERE matricule = ?',
            [nom, prenom, matricule]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }

        res.json({ message: "Étudiant mis à jour" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;