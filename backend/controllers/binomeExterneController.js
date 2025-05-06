const binomeExterneModel = require("../models/binomeExterneModel");

const getAllBinomes = (req, res) => {
    binomeExterneModel.getAllBinomesExterne((err, binomes) => {
        if (err) {
            console.error("Erreur lors de la récupération des binômes :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(binomes);
    });
};

module.exports = {
    getAllBinomes
};
