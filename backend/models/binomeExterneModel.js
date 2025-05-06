const { externalDb } = require("../config/db");

const getAllBinomesExterne = (callback) => {
    const sql = `SELECT * FROM BinomeExterne`;
    externalDb.query(sql, [], (err, results) => {
        callback(err, results);
    });
};

module.exports = {
    getAllBinomesExterne
};
