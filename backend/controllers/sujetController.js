// controllers/sujetController.js
const Sujet = require('../models/sujetModel');

exports.getSujetById = async (req, res) => {
  try {
    const sujet = await Sujet.findById(req.params.id);
    if (!sujet) {
      return res.status(404).json({ message: 'Sujet non trouvé' });
    }
    res.json(sujet);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};