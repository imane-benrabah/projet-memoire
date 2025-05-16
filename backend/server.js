const express = require("express");
const cors = require("cors");
const mysql = require('mysql2'); 
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require('dotenv').config(); // Charge les variables d'environnement

const app = express();

// Security Middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});
app.use('/api/', limiter);




const db = require("./config/db"); // Connexions principales et externes
const authRoutes = require('./routes/authRoutes');
const binomeExterneRoutes = require("./routes/binomeExterneRoutes");
const groupesRoutes = require('./routes/groupesRoutes');
const etapesRoutes = require('./routes/etapesRoutes');
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








// 📦 Middlewares utiles
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Configuration CORS (à mettre EN HAUT, juste après la création de l'app Express)
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS blocked for:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Gestion explicite des pré-requêtes OPTIONS
app.options('*', cors());

// Middleware pour les headers CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});




// 📁 Fichiers statiques
const upload = require(path.join(__dirname, '../middleware/upload'));

const staticPath = path.join(__dirname, '..', 'frontend', 'src', 'pages');

app.use(express.static(staticPath));

//  ROUTES



app.use('/api/auth', authRoutes);
app.use("/api", binomeExterneRoutes);
app.use('/api', groupesRoutes);
app.use('/etapes', etapesRoutes);
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






module.exports = app;
