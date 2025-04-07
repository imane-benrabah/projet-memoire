const db = require("../config/db");

module.exports = {
  getAll: (cb) => db.query("SELECT * FROM etudiant", cb),
  getByMatricule: (matricule, cb) => db.query("SELECT * FROM etudiant WHERE matricule = ?", [matricule], cb),
  create: (data, cb) => db.query("INSERT INTO etudiant (matricule, nom, prenom) VALUES (?, ?, ?)", [data.matricule, data.nom, data.prenom], cb),
  update: (matricule, data, cb) => db.query("UPDATE etudiant SET nom = ?, prenom = ? WHERE matricule = ?", [data.nom, data.prenom, matricule], cb),
  delete: (matricule, cb) => db.query("DELETE FROM etudiant WHERE matricule = ?", [matricule], cb)
};