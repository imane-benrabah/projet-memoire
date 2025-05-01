const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../../middleware/upload'); // <<== Ajout du middleware

// Route d'enregistrement avec upload d'image
router.post('/register/enseignant', upload.single('image'), authController.registerEnseignant);

// Route de login
router.post('/login', authController.login);

module.exports = router;
