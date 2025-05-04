const express = require("express");
const cors = require("cors");
const mysql = require('mysql2'); 
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');



const app = express();
const db = require("./config/db"); // Connexions principales et externes
const authRoutes = require('./routes/authRoutes'); 
const etudiantRoutes = require("./routes/etudiantRoutes");
const binomeRoutes = require("./routes/binomeRoutes");
const groupeRoutes = require("./routes/groupeRoutes");

app.use('/uploads', express.static(path.join(__dirname, 'middleware/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // Pour parser le JSON
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// Middleware
app.use(cors());

app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/binomes', binomeRoutes);
app.use('/api/groupes', groupeRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('✅ Serveur opérationnel');
});

// Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});