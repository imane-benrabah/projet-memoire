const express = require("express");
const router = express.Router();
const { registerEnseignant } = require("../controllers/enseignantController");

router.post("/register", registerEnseignant);

module.exports = router;
