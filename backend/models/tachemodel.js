const { mainDb } = require('../config/db'); // تأكد من المسار الصحيح إلى db.js

const getTachesByEtape = (id_etape, callback) => {
  const sql = 'SELECT * FROM tache WHERE idEtape = ?';
  mainDb.query(sql, [id_etape], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

module.exports = {
  getTachesByEtape
};

