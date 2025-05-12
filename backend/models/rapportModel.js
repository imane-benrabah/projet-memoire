const db = require('../config/db');

const RapportModel = {
    // Récupérer les tâches d'un étudiant
    getTasksByStudent: (idEtudiant, callback) => {
        const query = `
            SELECT t.* FROM Tache t
            JOIN Etape e ON t.idEtape = e.idEtape
            JOIN Sujet s ON e.idS = s.idS
            JOIN Groupe g ON s.idS = g.idS
            JOIN Binome b ON g.idG = b.idG
            JOIN Etudiant et ON b.idB = et.idB
            WHERE et.idU = ?
        `;
        db.mainDb.query(query, [idEtudiant], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Créer un nouveau rapport
    createReport: (titre, idB, callback) => {
        const query = 'INSERT INTO Rapport (titre, idB) VALUES (?, ?)';
        db.mainDb.query(query, [titre, idB], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.insertId);
        });
    },

    // Lier un rapport à une tâche
    linkReportToTask: (idR, idTache, callback) => {
        const query = 'INSERT INTO RapportTâches (idR, idTache) VALUES (?, ?)';
        db.mainDb.query(query, [idR, idTache], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Créer une version de rapport
    createReportVersion: (description, lien, idR, callback) => {
        const query = `
            INSERT INTO VersionRapport (description, lien, idR)
            VALUES (?, ?, ?)
        `;
        db.mainDb.query(query, [description, lien, idR], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.insertId);
        });
    },

    // Récupérer le binôme d'un étudiant
    getStudentBinome: (idEtudiant, callback) => {
        const query = 'SELECT idB FROM Etudiant WHERE idU = ?';
        db.mainDb.query(query, [idEtudiant], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]?.idB);
        });
    }
};

module.exports = RapportModel;
