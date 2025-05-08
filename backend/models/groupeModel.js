// models/groupeModel.js
const { mainDb } = require('../config/db');

// Fonction pour récupérer les groupes
const getGroupes = (callback) => {
  const query = 'SELECT idG, nom FROM Groupe';
  mainDb.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des groupes:', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getGroupes
};
