const mysql = require("mysql2");

const externalPool = mysql.createPool({
    host: "localhost", // ou une autre IP si la base est sur un autre serveur
    user: "root",
    password: "Imaiha123@123+=masamou",
    database: "consultation", // <- ta base externe
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    query: (sql, params, callback) => {
        externalPool.query(sql, params, (err, results, fields) => {
            callback(err, results);
        });
    },
    getConnection: (callback) => {
        externalPool.getConnection((err, connection) => {
            callback(err, connection);
        });
    },
    close: () => externalPool.end()
};
