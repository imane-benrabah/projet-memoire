const Binome = require('../models/BinomeModel');

exports.affecterResponsabilite = (req, res) => {
  const { binome, responsabilite, groupe } = req.body;

  // Validation des données
  if (!binome || !responsabilite || !groupe) {
    return res.status(400).json({ 
      success: false,
      message: 'Tous les champs sont requis' 
    });
  }

  // Vérifier si le binôme a déjà une responsabilité
  Binome.hasResponsabilite(binome, (error, hasResponsabilite) => {
    if (error) {
      console.error('Erreur:', error);
      return res.status(500).json({ 
        success: false,
        message: error.message || 'Une erreur est survenue' 
      });
    }

    if (hasResponsabilite) {
      // Récupérer la responsabilité actuelle
      Binome.getResponsabilite(binome, (error, currentResp) => {
        if (error) {
          console.error('Erreur:', error);
          return res.status(500).json({ 
            success: false,
            message: error.message || 'Une erreur est survenue' 
          });
        }

        res.status(400).json({
          success: false,
          message: `Ce binôme a déjà la responsabilité: ${currentResp}. Voulez-vous la modifier?`,
          currentResponsabilite: currentResp
        });
      });
    } else {
      // Affecter la nouvelle responsabilité
      Binome.affecterResponsabilite(binome, responsabilite, groupe, (error, result) => {
        if (error) {
          console.error('Erreur:', error);
          return res.status(500).json({ 
            success: false,
            message: error.message || 'Une erreur est survenue' 
          });
        }

        if (result) {
          res.json({ 
            success: true,
            message: `Responsabilité "${responsabilite}" affectée avec succès au binôme ${binome}`
          });
        } else {
          res.status(400).json({ 
            success: false,
            message: 'Échec de l\'affectation de la responsabilité' 
          });
        }
      });
    }
  });
};