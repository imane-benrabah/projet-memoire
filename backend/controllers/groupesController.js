const db = require('../config/db'); // base principale
const externalDb = require('../config/externalDb'); // base externe

exports.creerGroupeEtAssocierBinome = async (req, res) => {
    const { binomeId, groupeNom } = req.body;
    const enseignantId = req.headers['x-user-id'];

    if (!binomeId || !groupeNom || !enseignantId) {
        return res.status(400).json({ message: "Champs requis manquants." });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
        // 1. Créer le groupe
        const [groupeResult] = await conn.query(
            "INSERT INTO Groupe (nomGroupe, idEnseignant) VALUES (?, ?)",
            [groupeNom, enseignantId]
        );
        const groupeId = groupeResult.insertId;

        // 2. Chercher le binôme depuis la base externe
        const [binomeRows] = await externalDb.query(
            "SELECT * FROM Binome WHERE idBinome = ?",
            [binomeId]
        );

        if (binomeRows.length === 0) {
            throw new Error("Binôme non trouvé dans la base externe.");
        }

        const binomeExterne = binomeRows[0];

        // 3. Insérer dans la base principale
        await conn.query(
            "INSERT INTO Binome (idBinome, matricule1, nom1, prenom1, matricule2, nom2, prenom2, idGroupe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                binomeExterne.idBinome,
                binomeExterne.matricule1,
                binomeExterne.nom1,
                binomeExterne.prenom1,
                binomeExterne.matricule2,
                binomeExterne.nom2,
                binomeExterne.prenom2,
                groupeId
            ]
        );

        await conn.commit();
        res.status(201).json({ message: "Groupe créé et binôme associé avec succès." });
    } catch (err) {
        await conn.rollback();
        console.error("Erreur:", err.message);
        res.status(500).json({ message: "Erreur serveur lors de la création du groupe et de l’association du binôme." });
    } finally {
        conn.release();
    }
};
