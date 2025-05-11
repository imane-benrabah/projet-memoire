const upload = require('../middlewares/upload'); // تأكد من أن المسار صحيح
const rapportController = require('../controllers/rapportController'); // التأكد من الاستيراد الصحيح
const router = require('express').Router();

// مسار POST لإضافة تقرير
router.post('/rapport', upload.single('rapport'), rapportController.ajouterRapport);

module.exports = router;

