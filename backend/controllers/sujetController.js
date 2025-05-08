// controllers/sujetController.js
const db = require('../config/db'); // استيراد الاتصال بقاعدة البيانات

// دالة لجلب الموضوع بناءً على طالب
exports.getSujetByStudent = async (req, res) => {
  const studentId = req.params.idS; // id الطالب المرسل في الرابط

  try {
    // جلب الفوج الذي ينتمي إليه الطالب
    db.mainDb.query('SELECT idG FROM Etudiant WHERE idU = ?', [studentId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في الاستعلام' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'الطالب غير موجود في أي فوج' });
      }

      const groupeId = results[0].idG; // تحديد الـ idG للفوج

      // جلب الموضوع المرتبط بهذا الفوج
      db.mainDb.query('SELECT S.* FROM Sujet S JOIN Groupe G ON S.idS = G.idS WHERE G.idG = ?', [groupeId], (err, sujetResults) => {
        if (err) {
          return res.status(500).json({ message: 'خطأ في جلب الموضوع' });
        }

        if (sujetResults.length === 0) {
          return res.status(404).json({ message: 'لا يوجد موضوع مرتبط بهذا الفوج' });
        }

        res.json(sujetResults[0]); // إعادة الموضوع المرتبط بالفوج
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error });
  }
};

