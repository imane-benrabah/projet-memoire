const db = require('../config/db');
const mainDb = db.mainDb;

class Reunion {
  static creerReunion(titre, dateDebut, lien, remarque, idG, enseignantRId, callback) {
    mainDb.query(
      'INSERT INTO Reunion (titre, dateDebut, lien, remarque, idG, enseignantRId) VALUES (?, ?, ?, ?, ?, ?)',
      [titre, dateDebut, lien, remarque, idG, enseignantRId],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results.insertId);
      }
    );
  }

  static ajouterParticipant(idRN, etudiantId, etat, callback) {
    mainDb.query(
      'INSERT INTO Participation (etudiantId, idRN, etat) VALUES (?, ?, ?)',
      [etudiantId, idRN, etat],
      (error) => {
        if (error) return callback(error);
        callback(null);
      }
    );
  }

  static getGroupesByEnseignant(enseignantRId, callback) {
    mainDb.query(
      'SELECT idG, nom FROM Groupe WHERE enseignantRId = ?',
      [enseignantRId],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results);
      }
    );
  }

  static getEtudiantsByGroupe(idG, callback) {
    mainDb.query(
      `SELECT e.idU, u.nom, u.prenom, e.matricule 
       FROM Etudiant e 
       JOIN Utilisateur u ON e.idU = u.idU 
       JOIN Binome b ON e.idB = b.idB 
       WHERE b.idG = ?`,
      [idG],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results);
      }
    );
  }
}

module.exports = Reunion;