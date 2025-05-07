const express = require("express");
const router = express.Router();
const groupesController = require("../controllers/groupesController");

router.post("/", groupesController.creerGroupe);

module.exports = router;
