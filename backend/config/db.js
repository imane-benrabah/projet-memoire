const mysql = require("mysql2/promise"); // 1. Utilisez la version promise

// 2. Configurez le pool de connexions
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Imaiha123@123+=masamou",
    database: "projet",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 3. Test de connexion
async function testConnection() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("✅ Connecté à MySQL avec succès!");
    } catch (err) {
        console.error("❌ Erreur de connexion:", err);
    } finally {
        if (conn) conn.release();
    }
}

testConnection();

// 4. Exportez les méthodes
module.exports = {
    // Pour les requêtes simples
    query: (sql, params) => pool.query(sql, params),
    
    // Pour les transactions
    getConnection: () => pool.getConnection(),
    
    // Pour fermer le pool
    close: () => pool.end()
};