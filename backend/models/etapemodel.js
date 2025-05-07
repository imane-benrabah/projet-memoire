const db = require('../config/db');  // تأكد من المسار الصحيح

module.exports = {
    getAllEtapes: (callback) => {
        db.mainDb.query('SELECT * FROM Etape', (err, results) => {  // تصحيح الصيغة
            if (err) {
                console.error("Erreur lors de l'exécution de la requête SQL:", err);
                return callback(err, null); // إعادة الخطأ إلى الراوتر
            }
            callback(null, results); // إرسال النتائج بنجاح
        });
    }
};



