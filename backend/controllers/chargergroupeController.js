// controllers/groupeController.js
const db = require('../config/db');
const mainDb = db.mainDb;
const groupeModel = require('../models/groupeModel');

const getGroupes = (req, res) => {
  groupeModel.getGroupes((err, groupes) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des groupes' });
    }
    res.json(groupes);
  });
};

module.exports = {
  getGroupes
};
