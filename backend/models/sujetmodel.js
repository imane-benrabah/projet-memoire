// models/sujetModel.js
const mongoose = require('mongoose');

const sujetSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  reference: { type: String },
  prerequis: { type: String }
});

module.exports = mongoose.model('Sujet', sujetSchema);
