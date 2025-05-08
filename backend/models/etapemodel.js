const db = require('../config/db');  // تأكد من المسار الصحيح للملف الخاص بالاتصال بقاعدة البيانات

module.exports = {
    // دالة لاسترجاع جميع المراحل
    getAllEtapes: (callback) => {
        const query = 'SELECT * FROM Etape';  // الاستعلام لاسترجاع جميع المراحل
        db.mainDb.query(query, (err, results) => {
            if (err) {
                console.error("Erreur lors de l'exécution de la requête SQL:", err);
                return callback(err, null);  // إعادة الخطأ إلى الراوتر إذا حدث خطأ
            }
            callback(null, results);  // إرسال النتائج بنجاح
        });
    },

    // دالة لإضافة تقرير جديد
    addRapport: (data, callback) => {
        const { etapeId, description, rapportFile, dateDepot, dateEtape } = data;

        // افتراض أن لديك جدول 'Rapport' في قاعدة البيانات مع الأعمدة المناسبة
        const query = `
            INSERT INTO Rapport (etapeId, description, rapportFile, dateDepot, dateEtape) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.mainDb.query(query, [etapeId, description, rapportFile, dateDepot, dateEtape], (err, results) => {
            if (err) {
                console.error("Erreur lors de l'ajout du rapport:", err);
                return callback(err, null);  // إعادة الخطأ إلى الراوتر إذا حدث خطأ
            }
            callback(null, results);  // إرسال النتائج بنجاح
        });
    }
};

