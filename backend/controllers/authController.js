const CompteModel = require('../models/compteModel');
const UtilisateurModel = require('../models/UtilisateurModel');
const ConsultationModel = require('../models/consultationModel');
const bcrypt = require('bcryptjs'); // Assurez-vous de l'importer
const upload = require('../../middleware/upload');  // Utiliser ../../ pour remonter d'un niveau dans le backend



exports.registerEnseignant = async (req, res) => {
    const { nom, prenom, email, password, isResponsable, isPrincipal, bio, sexe, dateNaissance } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log({ nom, prenom, email, password, isResponsable, isPrincipal, bio, sexe, dateNaissance, image });

    // Vérification base externe
    ConsultationModel.verifyEnseignant(nom, prenom, (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' });
      if (results.length === 0) return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à créer un compte.' });

      // Création du compte avec mot de passe en clair (non sécurisé)
      CompteModel.create(email, password, (err, result) => {
        if (err) return res.status(400).json({ message: 'Email déjà utilisé' });

        const idC = result.insertId;

        // Création utilisateur
        UtilisateurModel.create(nom, prenom, image, bio, sexe, dateNaissance, idC, (err, resultU) => {
          if (err) {
            console.error('Erreur lors de la création de l\'utilisateur:', err); // Log de l'erreur
            return res.status(500).json({ message: 'Erreur utilisateur' });
          }

          const idU = resultU.insertId;

          UtilisateurModel.addEnseignant(idU, (err) => {
            if (err) return res.status(500).json({ message: 'Erreur enseignant' });

            if (isPrincipal) {
              UtilisateurModel.addPrincipal(idU, (err) => {
                if (err) return res.status(500).json({ message: 'Erreur principal' });
                return res.json({ message: 'Compte enseignant principal créé' });
              });
            } else if (isResponsable) {
              UtilisateurModel.addResponsable(idU, (err) => {
                if (err) return res.status(500).json({ message: 'Erreur responsable' });
                return res.json({ message: 'Compte enseignant responsable créé' });
              });
            } else {
              return res.json({ message: 'Compte enseignant créé' });
            }
          });
        });
      });
    });
};


  
exports.login = (req, res) => {
  const { email, password } = req.body;

  CompteModel.findByEmail(email, (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Email incorrect' });

    const compte = results[0];
    bcrypt.compare(password, compte.password, (err, match) => {
      if (!match) return res.status(401).json({ message: 'Mot de passe incorrect' });

      UtilisateurModel.findByIdC(compte.idC, (err, utilisateurs) => {
        if (err || utilisateurs.length === 0) return res.status(401).json({ message: 'Utilisateur non trouvé' });

        const utilisateur = utilisateurs[0];
        res.json({
          message: 'Connexion réussie',
          utilisateur
        });
      });
    });
  });
};