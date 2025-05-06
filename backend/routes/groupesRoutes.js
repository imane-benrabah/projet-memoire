const express = require("express");
const router = express.Router();
const groupesController = require("../controllers/groupesController");

router.post("/", groupesController.creerGroupeEtAssocierBinome);

module.exports = router;
