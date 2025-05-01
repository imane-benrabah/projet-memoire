const { externalDb } = require('../config/db');

const ConsultationModel = {
  verifyEnseignant: (nom, prenom, callback) => {
    externalDb.query('SELECT * FROM enseignants WHERE nom = ? AND prenom = ?', [nom, prenom], callback);
  }
};

module.exports = ConsultationModel;