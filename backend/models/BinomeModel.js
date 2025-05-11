const db = require('../config/db');
const mainDb = db.mainDb;

class Binome {
  // Vérifier si le binôme a déjà une responsabilité
  static hasResponsabilite(idB, callback) {
    mainDb.query('SELECT responsabilite FROM Binome WHERE idB = ?', [idB], (error, results) => {
      if (error) return callback(error);
      
      const hasResponsabilite = results.length > 0 && results[0].responsabilite !== null;
      callback(null, hasResponsabilite);
    });
  }

  // Affecter une responsabilité à un binôme
  static affecterResponsabilite(idB, responsabilite, idG, callback) {
    // Vérifier d'abord si le binôme existe dans le groupe
    mainDb.query('SELECT idB FROM Binome WHERE idB = ? AND idG = ?', [idB, idG], (error, results) => {
      if (error) return callback(error);
      if (results.length === 0) return callback(new Error('Binôme non trouvé dans ce groupe'));

      // Mettre à jour la responsabilité
      mainDb.query(
        'UPDATE Binome SET responsabilite = ? WHERE idB = ?',
        [responsabilite, idB],
        (error, results) => {
          if (error) return callback(error);
          callback(null, results.affectedRows > 0);
        }
      );
    });
  }

  // Récupérer la responsabilité actuelle d'un binôme
  static getResponsabilite(idB, callback) {
    mainDb.query('SELECT responsabilite FROM Binome WHERE idB = ?', [idB], (error, results) => {
      if (error) return callback(error);
      callback(null, results.length > 0 ? results[0].responsabilite : null);
    });
  }
}




module.exports = Binome;