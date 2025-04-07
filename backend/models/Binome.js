const db = require("../config/db");

module.exports = {
  // Créer un nouveau binôme
  create: (e1, e2, cb) => {
    db.query(
      "INSERT INTO binomes (etudiant1_matricule, etudiant2_matricule) VALUES (?, ?)", 
      [e1, e2 || null], 
      cb
    );
  },

  // Récupérer tous les binômes avec les infos des étudiants
  getAllWithEtudiants: (cb) => {
    db.query(`
      SELECT 
        b.id AS binome_id, 
        b.groupe_id,
        e1.matricule AS etudiant1_matricule, 
        e1.nom AS etudiant1_nom, 
        e1.prenom AS etudiant1_prenom, 
        e2.matricule AS etudiant2_matricule, 
        e2.nom AS etudiant2_nom, 
        e2.prenom AS etudiant2_prenom, 
        g.nom_groupe 
      FROM binomes b 
      LEFT JOIN etudiant e1 ON b.etudiant1_matricule = e1.matricule 
      LEFT JOIN etudiant e2 ON b.etudiant2_matricule = e2.matricule 
      LEFT JOIN groupe g ON b.groupe_id = g.id`, 
      cb
    );
  },

  // Récupérer les binômes par groupe
  getByGroup: (nom, cb) => {
    db.query(`
      SELECT 
        binomes.id AS binome_id,
        binomes.etudiant1_matricule, 
        e1.nom AS etudiant1_nom, 
        e1.prenom AS etudiant1_prenom, 
        binomes.etudiant2_matricule, 
        e2.nom AS etudiant2_nom, 
        e2.prenom AS etudiant2_prenom, 
        groupe.nom_groupe 
      FROM binomes 
      INNER JOIN groupe ON binomes.groupe_id = groupe.id 
      LEFT JOIN etudiant e1 ON binomes.etudiant1_matricule = e1.matricule 
      LEFT JOIN etudiant e2 ON binomes.etudiant2_matricule = e2.matricule 
      WHERE LOWER(groupe.nom_groupe) = LOWER(?)`, 
      [nom], 
      cb
    );
  },

  // Associer un binôme à un groupe
  associateToGroup: (binomeId, groupeId, cb) => {
    db.query(
      "UPDATE binomes SET groupe_id = ? WHERE id = ?", 
      [groupeId, binomeId], 
      cb
    );
  },

  // Récupérer un binôme par son ID
  getById: (id, cb) => {
    db.query(`
      SELECT 
        b.id AS binome_id,
        b.etudiant1_matricule,
        b.etudiant2_matricule,
        b.groupe_id,
        g.nom_groupe
      FROM binomes b
      LEFT JOIN groupe g ON b.groupe_id = g.id
      WHERE b.id = ?`, 
      [id], 
      cb
    );
  },

  // Supprimer un étudiant d'un binôme
  removeStudent: (binomeId, matricule, cb) => {
    db.beginTransaction(err => {
      if (err) return cb(err);

      // 1. Vérifier à quelle colonne appartient l'étudiant
      db.query(
        `SELECT 
          etudiant1_matricule, 
          etudiant2_matricule 
         FROM binomes 
         WHERE id = ?`,
        [binomeId],
        (err, results) => {
          if (err) return db.rollback(() => cb(err));

          const binome = results[0];
          let updateField = null;

          if (binome.etudiant1_matricule === matricule) {
            updateField = 'etudiant1_matricule';
          } else if (binome.etudiant2_matricule === matricule) {
            updateField = 'etudiant2_matricule';
          } else {
            return db.rollback(() => cb(new Error("L'étudiant n'appartient pas à ce binôme")));
          }

          // 2. Mettre à jour le binôme
          db.query(
            `UPDATE binomes 
             SET ${updateField} = NULL 
             WHERE id = ?`,
            [binomeId],
            (err, result) => {
              if (err) return db.rollback(() => cb(err));

              // 3. Vérifier si le binôme est maintenant vide
              db.query(
                `SELECT 
                  etudiant1_matricule IS NULL AS e1_null,
                  etudiant2_matricule IS NULL AS e2_null
                 FROM binomes 
                 WHERE id = ?`,
                [binomeId],
                (err, results) => {
                  if (err) return db.rollback(() => cb(err));

                  const { e1_null, e2_null } = results[0];
                  const isEmpty = e1_null && e2_null;

                  db.commit(err => {
                    if (err) return db.rollback(() => cb(err));
                    cb(null, { 
                      affectedRows: result.affectedRows,
                      isEmpty: isEmpty
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  },

  // Supprimer complètement un binôme
  delete: (id, cb) => {
    db.query(
      "DELETE FROM binomes WHERE id = ?", 
      [id], 
      cb
    );
  },

  // Vérifier si un étudiant appartient à un binôme
  studentBelongsToBinome: (matricule, binomeId, cb) => {
    db.query(
      `SELECT 1 
       FROM binomes 
       WHERE id = ? 
       AND (etudiant1_matricule = ? OR etudiant2_matricule = ?)`,
      [binomeId, matricule, matricule],
      (err, results) => {
        if (err) return cb(err);
        cb(null, results.length > 0);
      }
    );
  }
};