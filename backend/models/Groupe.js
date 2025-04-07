const db = require("../config/db");

module.exports = {
  getAllNames: (cb) => db.query("SELECT nom_groupe FROM groupe", cb),
  getIdByName: (nom, cb) => db.query("SELECT id FROM groupe WHERE nom_groupe = ?", [nom], cb)
};