const { mainDb } = require('../config/db');

// Fonction pour récupérer les tâches par étape avec l'évaluation
const getTachesByEtapeWithEvaluation = (id_etape, callback) => {
  // استعلام SQL لجلب المهام مع التقييمات
  const sql = `
    SELECT t.idTache, t.nom, IFNULL(er.description, 'Non évalué') AS evaluation
    FROM tache t
    LEFT JOIN EvaluationRapport er ON t.idR = er.idR
    WHERE t.idEtape = ?
  `;
  
  mainDb.query(sql, [id_etape], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

module.exports = {
  getTachesByEtapeWithEvaluation
};

