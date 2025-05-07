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
const binomeExterneRoutes = require("./routes/binomeExterneRoutes");
<<<<<<< HEAD
const groupesRoutes = require('./routes/groupesRoutes');
const etapesRoutes = require('./routes/etapesRoutes');
const tacheRoutes = require('./routes/tacheRoutes');
const sujetRoutes = require('./routes/sujetRoute');
=======
const groupesRoutes = require('./routes/groupesRoutes'); // Pas de faute de frappe





>>>>>>> 7709f0521dfb336c150b42fb2cc3e1b1b5a00a39

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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'], // <-- ajoute x-user-id ici

  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));



// 📦 Middlewares utiles
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});
// 🔒 En-têtes CORS + Type par défaut



// 📁 Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'middleware/uploads')));
const staticPath = path.join(__dirname, '..', 'frontend', 'src');
app.use(express.static(staticPath));


// 🌐 ROUTES

// ✅ Middleware temporaire pour simuler un utilisateur connecté
app.use((req, res, next) => {
  req.userId = "66469e362abeffbe891f80dc"; // Remplacer par un ID réel de votre base de données
  next();
});

app.use('/api/auth', authRoutes);
app.use("/api", binomeExterneRoutes);
<<<<<<< HEAD
app.use('/api', groupesRoutes);
app.use('/etapes', etapesRoutes);
app.use('/tache', tacheRoutes); 
app.use('/api/sujets', sujetRoutes);
=======
app.use('/api/groupes', groupesRoutes); // Doit matcher l'URL du fetch


// Route de test
app.get('/', (req, res) => {
  res.send('✅ Serveur opérationnel');
});

>>>>>>> 7709f0521dfb336c150b42fb2cc3e1b1b5a00a39
// Démarrage

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});