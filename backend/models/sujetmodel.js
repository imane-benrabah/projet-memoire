const { mainDb } = require('../config/db');

const sujetModel = {
  getById: (idS, callback) => {
    const sql = 'SELECT * FROM Sujet WHERE idS = ?';
    mainDb.query(sql, [idS], callback);
  },
  
  getByEtudiantId: (idEtudiant, callback) => {
    const sql = `
      SELECT s.* 
      FROM Sujet s
      JOIN Groupe g ON s.idS = g.idS
      JOIN Binome b ON g.idG = b.idG
      JOIN Etudiant e ON b.idB = e.idB
      WHERE e.idU = ?
    `;
    mainDb.query(sql, [idEtudiant], callback);
  },
  
  getReferencesById: (idS, callback) => {
    const sql = 'SELECT reference FROM RefrencesSujet WHERE idS = ?';
    mainDb.query(sql, [idS], callback);
  },
  
  getPrerequisById: (idS, callback) => {
    const sql = 'SELECT prerequis FROM PrerequisSujet WHERE idS = ?';
    mainDb.query(sql, [idS], callback);
  }
};

module.exports = sujetModel;