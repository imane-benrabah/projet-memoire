const express = require("express");
const router = express.Router();
const Groupe = require("../models/Groupe");

router.get("/", (req, res) => Groupe.getAllNames((err, data) => err ? res.status(500).json({ error: err }) : res.json(data)));

module.exports = router;
