// routes/casRoutes.js
const express = require('express');
const router = express.Router();
const casController = require('../controllers/casController');


router.get('/api/cas/:id', casController.getCasEtudiant);

//preciser cas
router.post('/sujets/:idS/cas-sujet', casController.enregistrerCasSujet);

//affecter cas
// Récupérer les cas et acteurs pour un binôme
router.get('/cas-et-acteurs', casController.getCasEtActeurs);

// Affecter des cas à un binôme
router.post('/affecter-cas', casController.affecterCas);


module.exports = router;
