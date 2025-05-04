const db = require('./db');

// Fonction wrapper pour convertir les callbacks en Promises
function queryAsync(pool, sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

module.exports = {
    mainDb: {
        query: (sql, params) => queryAsync(db.mainDb, sql, params),
        getConnection: () => new Promise((resolve, reject) => {
            db.mainDb.getConnection((err, connection) => {
                if (err) return reject(err);
                resolve(connection);
            });
        })
    },
    externalDb: {
        query: (sql, params) => queryAsync(db.externalDb, sql, params),
        getConnection: () => new Promise((resolve, reject) => {
            db.externalDb.getConnection((err, connection) => {
                if (err) return reject(err);
                resolve(connection);
            });
        })
    }
};