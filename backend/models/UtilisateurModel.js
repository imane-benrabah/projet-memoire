const { mainDb } = require('../config/db');

const UtilisateurModel = {
  create: (nom, prenom, image, bio, sexe, dateNaissance, idC, callback) => {
    const sql = 'INSERT INTO Utilisateur (nom, prenom, image, bio, sexe, dateNaissance, idC) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [nom, prenom, image, bio, sexe, dateNaissance, idC];

    mainDb.query(sql, params, callback);
  },

  findByIdC: (idC, callback) => {
    mainDb.query('SELECT * FROM Utilisateur WHERE idC = ?', [idC], callback);
  },

  addEnseignant: (idU, callback) => {
    mainDb.query('INSERT INTO Enseignant (idU) VALUES (?)', [idU], callback);
  },

  addResponsable: (idU, callback) => {
    mainDb.query('INSERT INTO EnseignantResponsable (idU) VALUES (?)', [idU], callback);
  },

  addPrincipal: (idU, callback) => {
    mainDb.query('INSERT INTO EnseignantPrincipal (idU) VALUES (?)', [idU], callback);
  }
};

module.exports = UtilisateurModel;
