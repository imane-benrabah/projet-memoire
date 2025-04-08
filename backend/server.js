const express = require("express");
const cors = require("cors");
const mysql = require('mysql2'); 
const router = express.Router();
const app = express();
const db = require("./config/db");
const etudiantRoutes = require("./routes/etudiantRoutes");
const binomeRoutes = require("./routes/binomeRoutes");
const groupeRoutes = require("./routes/groupeRoutes");

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });


app.use(express.json());
app.use(express.static("public"));


// Routes
console.log(typeof etudiantRoutes); 
app.use("/api/etudiants", etudiantRoutes);
app.use("/api/binomes", binomeRoutes);
app.use("/api/groupes", groupeRoutes);


// Route DELETE pour supprimer un étudiant de son binôme
app.delete('/api/etudiants/:matricule', (req, res) => {
    const matricule = req.params.matricule;

    // 1. Mise à jour des binômes
    const updateQuery = `
        UPDATE binomes 
        SET etudiant1_matricule = IF(etudiant1_matricule = ?, NULL, etudiant1_matricule),
            etudiant2_matricule = IF(etudiant2_matricule = ?, NULL, etudiant2_matricule)
        WHERE etudiant1_matricule = ? OR etudiant2_matricule = ?`;

    db.query(updateQuery, [matricule, matricule, matricule, matricule], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("Erreur UPDATE:", updateErr);
            return res.status(500).json({ 
                success: false,
                message: "Erreur lors de la mise à jour du binôme"
            });
        }

        // 2. Suppression des binômes vides
        const deleteQuery = `DELETE FROM binomes WHERE etudiant1_matricule IS NULL AND etudiant2_matricule IS NULL`;
        
        db.query(deleteQuery, (deleteErr, deleteResult) => {
            if (deleteErr) {
                console.error("Erreur DELETE:", deleteErr);
                return res.status(500).json({ 
                    success: false,
                    message: "Erreur lors de la suppression des binômes vides"
                });
            }

            res.json({ 
                success: true,
                message: "Étudiant supprimé avec succès",
                stats: {
                    binomes_updated: updateResult.affectedRows,
                    empty_binomes_deleted: deleteResult.affectedRows
                }
            });
        });
    });
});

module.exports = router;
  

app.listen(3000, () => {
  console.log("🚀 Serveur démarré sur le port 3000");
});