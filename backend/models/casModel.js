// models/casModel.js
const db = require('../config/db'); // افترض أنك تملك ملف db.js فيه إعدادات MySQL

exports.getCasByEtudiantId = (idEtudiant, callback) => {
    const query = `
        SELECT Cas.cas, Cas.acteur 
        FROM Cas
        INNER JOIN Binome ON Cas.idB = Binome.idB
        WHERE Binome.idE1 = ? OR Binome.idE2 = ?
    `;
    db.mainDb.query(query, [idEtudiant, idEtudiant], callback);
};


exports.createCasPourSujet = function(idS, acteurs, callback) {
    // Vérifier qu'il y a des acteurs à enregistrer
    if (!acteurs || acteurs.length === 0) {
        return callback(new Error("Aucun acteur à enregistrer"));
    }

    // Préparer les requêtes pour chaque cas de chaque acteur
    const queries = [];
    const values = [];
    
    acteurs.forEach(acteur => {
        // Vérifier que l'acteur a bien des cas
        if (!acteur.cas || !Array.isArray(acteur.cas)) {
            return;
        }
        
        // Pour chaque cas de l'acteur, créer une ligne séparée
        acteur.cas.forEach(casItem => {
            queries.push("(?, ?, ?, ?)");
            values.push(acteur.acteur, casItem, 'en cours', idS);
        });
    });
    
    if (queries.length === 0) {
        return callback(new Error("Aucun cas valide à enregistrer"));
    }

    const sql = `INSERT INTO Cas (acteur, cas, statut, idS) VALUES ${queries.join(',')}`;
    
    db.mainDb.query(sql, values, function(err, result) {
        if (err) {
            console.error("Erreur SQL:", err);
            return callback(err);
        }
        callback(null, result.affectedRows);
    });
};


exports.verifyResponsableSujet = function(idS, idResponsable, callback) {
    const sql = `SELECT 1 FROM Sujet WHERE idS = ? AND enseignantRId = ?`;
    db.mainDb.query(sql, [idS, idResponsable], function(err, results) {
        if (err) return callback(err);
        callback(null, results.length > 0);
    });
};



exports.getCasBySujet = function(sujetId, callback) {
    db.mainDb.query(
        `SELECT idCas, acteur, cas, statut 
         FROM Cas 
         WHERE idS = ? 
         ORDER BY acteur, cas`,
        [sujetId],
        (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        }
    );
};

exports.getActeursBySujet = function(sujetId, callback) {
    db.mainDb.query(
        `SELECT DISTINCT acteur FROM Cas 
         WHERE idS = ? ORDER BY acteur`,
        [sujetId],
        (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.map(r => r.acteur));
        }
    );
};

exports.affecterCasAuBinome = function(binomeId, casIds, callback) {
    db.mainDb.query(
        `UPDATE Cas SET idB = ?, statut = 'affecté' 
         WHERE idCas IN (?)`,
        [binomeId, casIds],
        (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.affectedRows);
        }
    );
};