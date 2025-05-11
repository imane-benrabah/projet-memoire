const Rapport = require('../models/rapportModel'); // تأكد من استيراد النموذج بشكل صحيح

const ajouterRapport = (req, res) => {
  const { etapeId, description, dateDepot, dateEtape, simulate } = req.body;

  let filePath = null;

  // إذا كان simulate موجودًا، لن نقوم بتحميل الملف
  if (!simulate) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Le fichier est requis.' });
    }
    filePath = file.path.replace(/\\/g, '/'); // مسار الملف
  }

  // تحديد التاريخ الحالي لإنشاء الـ createdAt
  const createdAt = new Date();

  // إنشاء التقرير الجديد
  const nouveauRapport = new Rapport({
    etapeId,
    description,
    dateDepot,
    dateEtape,
    fichier: filePath,
    createdAt, // إضافة التاريخ الحالي
  });

  // حفظ التقرير في قاعدة البيانات
  nouveauRapport.save()
    .then(() => res.status(201).json({ message: 'Rapport ajouté avec succès.' }))
    .catch((error) => res.status(500).json({ error: 'Erreur lors de l\'enregistrement du rapport.', details: error }));
};

module.exports = { ajouterRapport };
