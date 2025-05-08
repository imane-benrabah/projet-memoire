// routes/sujetRoutes.js
const express = require('express');
const router = express.Router();
const sujetController = require('../controllers/sujetController');

// إضافة مسار جديد للحصول على الموضوع بناءً على الطالب
router.get('/etudiant/:idS', sujetController.getSujetByStudent);

module.exports = router;
