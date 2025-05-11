const { mainDb } = require('../config/db');

const sujetModel = {
  getById: (idS, callback) => {
    const sql = 'SELECT * FROM sujets WHERE idS = ?';
    mainDb.query(sql, [idS], callback);
  },
};
module.exports = sujetModel;
