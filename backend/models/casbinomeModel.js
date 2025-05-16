const db = require('../config/db');

exports.getSujetByBinome = function(binomeId, callback) {
    db.mainDb.query(
        `SELECT s.idS, s.titre 
         FROM Sujet s
         JOIN Groupe g ON s.idS = g.idS
         JOIN Binome b ON g.idG = b.idG
         WHERE b.idB = ?`,
        [binomeId],
        (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]);
        }
    );
};