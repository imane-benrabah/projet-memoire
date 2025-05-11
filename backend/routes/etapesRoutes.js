const express = require('express');
const router = express.Router();
const etapesModel = require('../models/etapemodel');
const multer = require('multer');
const path = require('path');

// إعداد multer لتحميل الملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // تأكد من وجود مجلد 'uploads' في المسار المناسب
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // إضافة timestamp للملف لضمان الاسم الفريد
    }
});

const upload = multer({ storage: storage });

// نقطة نهاية GET لاسترجاع جميع المراحل (étapes)
router.get('/', (req, res) => {
    etapesModel.getAllEtapes((err, etapes) => {
        if (err) {
            console.error('Erreur lors de la récupération des étapes:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(etapes);
    });
});

// نقطة نهاية POST لتحميل التقرير
router.post('/rapport', upload.single('rapport'), (req, res) => {
    const { etapeId, description, dateDepot, dateEtape } = req.body;
    const rapportFile = req.file ? req.file.filename : null;  // الحصول على اسم الملف المحمّل

    // التحقق من صحة البيانات المدخلة
    if (!etapeId || !description || !rapportFile || !dateDepot || !dateEtape) {
        return res.status(400).json({ error: 'Veuillez remplir tous les champs' });
    }

    const data = {
        etapeId,
        description,
        rapportFile,
        dateDepot,
        dateEtape
    };

    // إضافة التقرير في قاعدة البيانات
    etapesModel.addRapport(data, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'ajout du rapport' });
        }
        res.status(200).json({ message: 'Rapport envoyé avec succès!' });
    });
});

module.exports = router;

