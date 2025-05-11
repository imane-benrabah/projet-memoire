const express = require('express');
const router = express.Router();
const sujetController = require('../controllers/sujetController');

// إضافة مسار جديد للحصول على الموضوع بناءً على الطالب
router.get('/etudiant/:idS', sujetController.getSujetByStudent);

router.post('/ajouter', sujetController.ajouterSujet);

router.get('/sujets', sujetController.getAllSujets);

router.get("/sujets-par-responsable/:id", sujetController.getSujetsByResponsable);



router.get('/:id', sujetController.getSujetById);


module.exports = router;