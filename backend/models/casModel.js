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
