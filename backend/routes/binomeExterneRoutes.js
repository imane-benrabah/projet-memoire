const express = require("express");
const router = express.Router();
const binomeExterneController = require("../controllers/binomeExterneController");

// GET /api/binomes-externe
router.get("/binomes-externe", binomeExterneController.getAllBinomes);

module.exports = router;
