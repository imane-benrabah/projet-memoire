const mysql = require("mysql2");

// Connexion à la base principale (projet)
const mainPool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Imaiha123@123+=masamou",
    database: "projet",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connexion à la base externe (consultation)
const externalPool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Imaiha123@123+=masamou",
    database: "consultation",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export des méthodes avec séparation entre principale et externe
module.exports = {
    mainDb: {
        query: (sql, params, callback) => {
            mainPool.query(sql, params, (err, results) => {
                callback(err, results);
            });
        },
        getConnection: (callback) => {
            mainPool.getConnection((err, connection) => {
                callback(err, connection);
            });
        },
        close: () => mainPool.end()
    },

    externalDb: {
        query: (sql, params, callback) => {
            externalPool.query(sql, params, (err, results) => {
                callback(err, results);
            });
        },
        getConnection: (callback) => {
            externalPool.getConnection((err, connection) => {
                callback(err, connection);
            });
        },
        close: () => externalPool.end()
    }
};
