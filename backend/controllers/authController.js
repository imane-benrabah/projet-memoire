const CompteModel = require('../models/compteModel');
const UtilisateurModel = require('../models/UtilisateurModel');
const ConsultationModel = require('../models/consultationModel');
const authModel = require('../models/authModel');


exports.registerEnseignant = async (req, res) => {
  try {
    console.log('\n=== NOUVELLE INSCRIPTION ===');
    console.log('Données reçues:', {
      body: req.body,
      file: req.file ? req.file.filename : null
    });

    const { nom, prenom, email, password, bio, sexe, dateNaissance } = req.body;
    
    // Conversion robuste des checkbox
    const isResponsable = ['true', true, 'on', '1'].includes(req.body.isResponsable);
    const isPrincipal = ['true', true, 'on', '1'].includes(req.body.isPrincipal);
    const image = req.file ? req.file.filename : null;

    console.log('Valeurs converties:', {
      isResponsable,
      isPrincipal,
      image
    });

    // 1. Vérification dans la base externe
    console.log('\n=== VÉRIFICATION ENSEIGNANT ===');
    const enseignantValide = await new Promise((resolve, reject) => {
      ConsultationModel.verifyEnseignant(nom, prenom, (err, results) => {
        if (err) reject(err);
        resolve(results.length > 0);
      });
    });

    if (!enseignantValide) {
      console.log('Échec vérification: enseignant non autorisé');
      return res.status(403).json({ message: 'Autorisation refusée' });
    }

    // 2. Création du compte
    console.log('\n=== CRÉATION COMPTE ===');
    const compte = await new Promise((resolve, reject) => {
      CompteModel.create(email, password, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    const idC = compte.insertId;
    console.log('Compte créé - idC:', idC);

    // 3. Création utilisateur
    console.log('\n=== CRÉATION UTILISATEUR ===');
    const utilisateur = await new Promise((resolve, reject) => {
      UtilisateurModel.create(nom, prenom, image, bio, sexe, dateNaissance, idC, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    const idU = utilisateur.insertId;
    console.log('Utilisateur créé - idU:', idU);

    // 4. Ajout comme enseignant de base (toujours)
    console.log('\n=== AJOUT ENSEIGNANT DE BASE ===');
    await new Promise((resolve, reject) => {
      UtilisateurModel.addEnseignant(idU, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // 5. Ajout des rôles supplémentaires
    console.log('\n=== AJOUT RÔLES SUPPLÉMENTAIRES ===');
    const rolesAjoutes = [];
    
    if (isPrincipal) {
      console.log('Principal détecté, insertion...');
      await new Promise((resolve, reject) => {
        UtilisateurModel.addPrincipal(idU, (err) => {
          if (err) reject(err);
          else {
            rolesAjoutes.push('principal');
            console.log('Ajout dans EnseignantPrincipal réussi');
            resolve();
          }
        });
      });
    } else {
      console.log('Principal NON détecté');
    }
    

    if (isResponsable) {
      console.log('Responsable détecté, insertion...');
      await new Promise((resolve, reject) => {
        UtilisateurModel.addResponsable(idU, (err) => {
          if (err) reject(err);
          else {
            rolesAjoutes.push('responsable');
            console.log('Ajout dans EnseignantResponsable réussi');
            resolve();
          }
        });
      });
    } else {
      console.log('Responsable NON détecté');
    }
    

    console.log('Rôles ajoutés:', rolesAjoutes.length > 0 ? rolesAjoutes : 'aucun');

    // Réponse finale
    let message = 'Compte enseignant créé';
    if (isPrincipal && isResponsable) message = 'Compte enseignant principal et responsable créé';
    else if (isPrincipal) message = 'Compte enseignant principal créé';
    else if (isResponsable) message = 'Compte enseignant responsable créé';

    console.log('\n=== INSCRIPTION RÉUSSIE ===');
    console.log('Message:', message);
    
    return res.status(201).json({ 
      success: true,
      message,
      data: { idU, idC }
    });

  } catch (error) {
    console.error('\n=== ERREUR ===\n', error);
    
    if (error.message.includes('Email')) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    if (error.message.includes('enseignant')) {
      return res.status(500).json({ message: 'Erreur création enseignant' });
    }
    
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur de la connexion
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
      // 1. Vérification des identifiants
      const user = await authModel.checkCredentials(email, password);

      // 2. Récupération des rôles avec gestion d'erreur améliorée
      let roles;
      try {
          roles = await authModel.getRoles(user.idC);
      } catch (rolesError) {
          console.error('Erreur de récupération des rôles:', rolesError);
          return res.status(500).json({ 
              success: false,
              message: 'Erreur lors de la détermination de votre profil'
          });
      }

      // 3. Détermination de la redirection
      let redirectTo = '/';
      
      if (!roles) {
          console.error('Aucun rôle retourné pour l\'utilisateur:', user.idC);
          return res.status(403).json({
              success: false,
              message: 'Profil non reconnu'
          });
      }

      switch (roles.role) {
          case 'admin':
              redirectTo = '/acceuil_admin.html';
              break;
          case 'enseignant':
              if (roles.type === 'principal') {
                  redirectTo = '/acceuil_p.html';
              } else if (roles.type === 'responsable') {
                  redirectTo = '/acceuil_re.html';
              } else {
                  redirectTo = '/acceuil_enseignant.html';
              }
              break;
          case 'etudiant':
              if (roles.type === 'responsable_memoire') {
                  redirectTo = '/acceuil_rm.html';
              } else if (roles.type === 'responsable_etape') {
                  redirectTo = '/acceuil_re.html';
              } else {
                  redirectTo = '/acceuil_etudiant.html';
              }
              break;
          default:
              redirectTo = '/';
      }

      // 4. Réponse
      return res.status(200).json({ 
          success: true,
          message: 'Connexion réussie', 
          redirectTo,
          userData: {
              id: user.idC,
              email: user.email,
              role: roles.role,
              roleType: roles.type || null
          }
      });

  } catch (err) {
      console.error('Erreur complète de connexion:', err);
      
      let status = 500;
      let message = 'Erreur serveur';
      
      if (err.message.includes('Email') || err.message.includes('Mot de passe')) {
          status = 400;
          message = 'Email ou mot de passe incorrect';
      }
      
      return res.status(status).json({ 
          success: false,
          message 
      });
  }
};
exports.login = login;

