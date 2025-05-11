const db = require('../config/db'); // الاتصال بقاعدة البيانات

const Rapport = {
  // إنشاء تقرير جديد
  create: (etapeId, description, filePath, dateDepot, dateEtape, callback) => {
    const sql = `
      INSERT INTO rapport (etapeId, description, filePath, dateDepot, dateEtape, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const createdAt = new Date(); // تعيين التاريخ الحالي
    db.query(sql, [etapeId, description, filePath, dateDepot, dateEtape, createdAt], callback);
  }
};

module.exports = Rapport;

