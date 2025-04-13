const bcrypt = require('bcrypt');
const db = require('../db/db'); // base locale
const externalDb = require('../db/externalDb'); // base externe

const registerEnseignant = (req, res) => {
    const { nom, prenom, email, password } = req.body;

    // Étape 1 : Vérifier dans la base externe
    externalDb.query(
        "SELECT * FROM enseignants_officiels WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ error: "Erreur avec la base externe" });

            if (results.length === 0) {
                return res.status(403).json({ message: "Accès réservé uniquement aux enseignants reconnus" });
            }

            const enseignantExterne = results[0];
            const role = enseignantExterne.role; // 'principal' ou 'responsable'

            // Étape 2 : Vérifier s’il est déjà inscrit localement
            db.query(
                "SELECT * FROM enseignants WHERE email = ?",
                [email],
                async (err, existing) => {
                    if (err) return res.status(500).json({ error: "Erreur avec la base locale" });

                    if (existing.length > 0) {
                        return res.status(400).json({ message: "Ce compte existe déjà" });
                    }

                    // Étape 3 : Hasher le mot de passe
                    const hashedPassword = await bcrypt.hash(password, 10);

                    // Étape 4 : Insérer dans la base locale
                    db.query(
                        "INSERT INTO enseignants (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)",
                        [nom, prenom, email, hashedPassword, role],
                        (err, result) => {
                            if (err) return res.status(500).json({ error: "Erreur lors de la création du compte" });

                            // Étape 5 : Retour
                            return res.status(201).json({
                                message: "Compte enseignant créé avec succès",
                                redirectTo: role === "principal" ? "/interface/principal" : "/interface/responsable"
                            });
                        }
                    );
                }
            );
        }
    );
};

module.exports = {
    registerEnseignant
};
