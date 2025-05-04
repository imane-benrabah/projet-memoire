const { mainDb } = require('../config/db');

const UtilisateurModel = {
  /**
   * Crée un utilisateur dans la table Utilisateur.
   * Tous les champs sont vérifiés pour éviter les valeurs undefined ou mal formées.
   */
  create: (nom, prenom, image, bio, sexe, dateNaissance, idC, callback) => {
    // Valeurs par défaut en cas d'undefined ou null
    image = image || null;
    bio = bio || null;
    sexe = sexe || null;

    // Vérifie que la date est bien une instance valide ou null
    let dateValide = null;
    if (dateNaissance && !isNaN(new Date(dateNaissance))) {
      dateValide = new Date(dateNaissance);
    }

    // Si des champs obligatoires sont manquants, retourne une erreur au lieu de planter silencieusement
    if (!nom || !prenom || !idC) {
      return callback(
        new Error('Champs obligatoires manquants : nom, prénom ou idC'),
        null
      );
    }

    const sql = `
      INSERT INTO Utilisateur (nom, prenom, image, bio, sexe, dateNaissance, idC)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [nom, prenom, image, bio, sexe, dateValide, idC];

    mainDb.query(sql, params, (err, result) => {
      if (err) {
        console.error('Erreur MySQL (create Utilisateur):', err.sqlMessage || err.message);
      }
      callback(err, result);
    });
  },

  /**
   * Trouve un utilisateur par identifiant de compte.
   */
  findByIdC: (idC, callback) => {
    mainDb.query('SELECT * FROM Utilisateur WHERE idC = ?', [idC], callback);
  },

  /**
   * Ajoute un enseignant simple lié à un utilisateur.
   */
  addEnseignant: (idU, callback) => {
    if (!idU) return callback(new Error('idU requis pour ajouter un enseignant'));
    mainDb.query('INSERT INTO Enseignant (idU) VALUES (?)', [idU], callback);
  },

  /**
   * Ajoute un enseignant responsable.
   */
  addResponsable: (idU, callback) => {
    if (!idU) return callback(new Error('idU requis pour ajouter un responsable'));
    const sql = 'INSERT INTO EnseignantResponsable (idU) VALUES (?)';
    mainDb.query(sql, [idU], callback);
  },

  /**
   * Ajoute un enseignant principal.
   */
  addPrincipal: (idU, callback) => {
    if (!idU) return callback(new Error('idU requis pour ajouter un principal'));
    const sql = 'INSERT INTO EnseignantPrincipal (idU) VALUES (?)';
    mainDb.query(sql, [idU], callback);
  }
};

module.exports = UtilisateurModel;
