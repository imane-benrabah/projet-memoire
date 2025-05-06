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


// 🔧 CONFIGURATION CORS UNE SEULE FOIS ET EN HAUT
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(cors());



// 📦 Middlewares utiles
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 🔒 En-têtes CORS + Type par défaut



// 📁 Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'middleware/uploads')));
const staticPath = path.join(__dirname, '..', 'frontend', 'src');
app.use(express.static(staticPath));

// 🌐 ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/binomes', binomeRoutes);
app.use('/api/groupes', groupeRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('✅ Serveur opérationnel');
});

// Démarrage

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});