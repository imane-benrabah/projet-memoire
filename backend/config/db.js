const mysql = require("mysql2"); // Ne pas utiliser "mysql2/promise"

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Imaiha123@123+=masamou",
    database: "projet",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export des méthodes pour effectuer des requêtes SQL avec des callbacks
module.exports = {
    query: (sql, params, callback) => {
        pool.query(sql, params, (err, results, fields) => {
            callback(err, results); // Appel du callback avec les résultats
        });
    },
    getConnection: (callback) => {
        pool.getConnection((err, connection) => {
            callback(err, connection); // Retourne la connexion avec le callback
        });
    },
    close: () => pool.end()
};
