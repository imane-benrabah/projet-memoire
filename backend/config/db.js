const mysql = require("mysql2");

// Création de la connexion MySQL
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Imaiha123@123+=masamou",  // Assure-toi de ne pas laisser ton mot de passe en clair en production
    database: "projet",
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion à MySQL :", err);
        return;
    }
    console.log("✅ Connecté à MySQL !");
});

module.exports = connection;  // Exporte la connexion pour l'utiliser dans d'autres fichiers
