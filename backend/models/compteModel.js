const { mainDb } = require('../config/db');

const CompteModel = {
  create: (email, password, callback) => {
    mainDb.query('INSERT INTO Compte (email, password) VALUES (?, ?)', [email, password], callback);
  },
  findByEmail: (email, callback) => {
    mainDb.query('SELECT * FROM Compte WHERE email = ?', [email], callback);
  }
};

module.exports = CompteModel;
