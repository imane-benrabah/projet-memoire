const { mainDb } = require('../config/db');

exports.ajouterSujet = (req, res) => {
    const { titre, description, enseignantRId, references, prerequis } = req.body;

    // Validation des données requises
    if (!titre || !description || !enseignantRId) {
        return res.status(400).json({ 
            message: "Titre, description et ID enseignant sont requis." 
        });
    }

    // Vérification que l'enseignantRId est un nombre valide
    if (isNaN(enseignantRId)) {
        return res.status(400).json({ 
            message: "ID enseignant invalide." 
        });
    }

    // Étape 1 : Insertion dans Sujet
    mainDb.query(
        'INSERT INTO Sujet (titre, description, enseignantRId) VALUES (?, ?, ?)',
        [titre, description, enseignantRId],
        (err, result) => {
            if (err) {
                console.error("Erreur insertion Sujet :", err);
                return res.status(500).json({ 
                    message: "Erreur lors de l'ajout du sujet.",
                    error: err.message 
                });
            }

            const idS = result.insertId;

            // Fonction pour insérer les références
            const insererReferences = (callback) => {
                if (references && references.length > 0) {
                    let completed = 0;
                    let hasError = false;
                    
                    references.forEach(ref => {
                        mainDb.query(
                            'INSERT INTO RefrencesSujet (reference, idS) VALUES (?, ?)',
                            [ref, idS],
                            (err) => {
                                if (err && !hasError) {
                                    hasError = true;
                                    console.error("Erreur insertion référence :", err);
                                    return callback(err);
                                }
                                completed++;
                                if (completed === references.length && !hasError) {
                                    callback(null);
                                }
                            }
                        );
                    });
                } else {
                    callback(null);
                }
            };

            // Fonction pour insérer les prérequis
            const insererPrerequis = (callback) => {
                if (prerequis && prerequis.length > 0) {
                    let completed = 0;
                    let hasError = false;
                    
                    prerequis.forEach(pre => {
                        mainDb.query(
                            'INSERT INTO PrerequisSujet (prerequis, idS) VALUES (?, ?)',
                            [pre, idS],
                            (err) => {
                                if (err && !hasError) {
                                    hasError = true;
                                    console.error("Erreur insertion prérequis :", err);
                                    return callback(err);
                                }
                                completed++;
                                if (completed === prerequis.length && !hasError) {
                                    callback(null);
                                }
                            }
                        );
                    });
                } else {
                    callback(null);
                }
            };

            // Exécution en série pour mieux gérer les erreurs
            insererReferences((err) => {
                if (err) {
                    return res.status(500).json({ 
                        message: "Erreur lors de l'ajout des références.",
                        error: err.message 
                    });
                }
                
                insererPrerequis((err) => {
                    if (err) {
                        return res.status(500).json({ 
                            message: "Erreur lors de l'ajout des prérequis.",
                            error: err.message 
                        });
                    }
                    
                    return res.status(200).json({ 
                        message: "Sujet ajouté avec succès !",
                        idS: idS
                    });
                });
            });
        }
    );

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

};};

