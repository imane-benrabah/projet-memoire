const express = require("express");
const cors = require("cors");
const mysql = require('mysql2'); 
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');



const app = express();
const db = require("./config/db"); // Connexions principales et externes
const authRoutes = require('./routes/authRoutes');
const binomeExterneRoutes = require("./routes/binomeExterneRoutes");
const groupesRoutes = require('./routes/groupesRoutes');
const etapesRoutes = require('./routes/etapesRoutes');
const tacheRoutes = require('./routes/tacheRoutes');
const sujetRoutes = require('./routes/sujetRoutes');
const chargergroupeRoutes = require('./routes/chargergroupeRoutes');
const etudiantinfoRoutes = require('./routes/etudiantinfoRoutes');
const profilRoutes = require('./routes/profilRoutes');
const groupenseignantRoutes = require('./routes/groupenseignantRoutes');
const rapportRoutes = require('./routes/rapportRoutes');
const casRoutes = require('./routes/casRoutes');
const etapeRoutes = require('./routes/etapeRoutes'); 
const presenceRoutes = require('./routes/presenceRoutes');
const BinomeRoutes = require('./routes/BinomeRoutes');
const reunionRoutes = require('./routes/reunionRoutes');












// 🔧 CONFIGURATION CORS UNE SEULE FOIS ET EN HAUT
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
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
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(cors({
  origin: '*', // À remplacer en production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));



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
const staticPath = path.join(__dirname, '..', 'frontend', 'src', 'pages');

app.use(express.static(staticPath));

// 🌐 ROUTES



app.use('/api/auth', authRoutes);
app.use("/api", binomeExterneRoutes);
app.use('/api', groupesRoutes);
app.use('/etapes', etapesRoutes);
app.use('/tache', tacheRoutes); 
app.use('/api/groupes', groupesRoutes); // Doit matcher l'URL du fetch
app.use('/api', chargergroupeRoutes);
app.use('/api/groupes', etudiantinfoRoutes);
app.use('/api//profil', profilRoutes);
app.use('/api/groupes', groupenseignantRoutes);
app.use('/api/sujet', sujetRoutes);
app.use('/api', casRoutes);
app.use('/api', rapportRoutes);
app.use('/api/sujets', sujetRoutes); 
app.use("/api", sujetRoutes);
app.use('/api', etapeRoutes); 
app.use('/api', presenceRoutes); // Doit être monté avant les autres middlewares
app.use('/api', BinomeRoutes); // Doit être monté avant les autres middlewares
app.use('/api', reunionRoutes);












// Route de test


// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});



// Démarrage

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});