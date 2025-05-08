const express = require('express');
const router = express.Router();
const sujetController = require('../controllers/sujetController');


router.post('/ajouter', sujetController.ajouterSujet);

// إضافة مسار جديد للحصول على الموضوع بناءً على الطالب
router.get('/etudiant/:idS', sujetController.getSujetByStudent);

router.get('/:idS', sujetController.getSujetById);
module.exports = router;
