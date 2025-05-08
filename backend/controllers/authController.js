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
    
    return res.status(200).json({ 
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

  // Headers CORS
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    // 1. Authentification stricte
    const user = await authModel.checkCredentials(email, password);
    
    // 2. Récupération des rôles
    const roles = await authModel.getRoles(user.idC);
    if (!roles || !roles.role) {
      throw new Error('Rôle utilisateur non trouvé');
    }

    // 3. Configuration des redirections
    const redirections = {
      admin: 'acceuil_admin.html',
      enseignant: {
        principal: 'acceuil_p.html',
        responsable: 'acceuil_res.html',
        standard: 'acceuil_enseignant.html'
      },
      etudiant: {
        responsable_memoire: 'acceuil_etu_res_mem.html',
        responsable_etape: 'acceuil_etu_res.html',
        standard: 'acceuil_etudiant.html'
      }
    };

    const page = redirections[roles.role]?.[roles.type] || redirections[roles.role]?.standard;
    if (!page) {
      throw new Error('Page de destination non configurée');
    }

    // Réponse de SUCCÈS claire
    return res.status(200).json({
      success: true,
      message: 'Authentification validée',
      redirectTo: `/src/pages/${page}`, // ou le chemin réel
      user: {
        id: user.idC,
        email: user.email,
        role: roles.role,
        type: roles.type || null
      }
    });


  } catch (err) {
    // Réponse d'ERREUR claire
    console.error('Erreur:', err.message);
    return res.status(401).json({
      success: false, // <-- Doit être false pour les échecs
      message: err.message.includes('Email') ? 'Email incorrect' : 
               err.message.includes('Mot de passe') ? 'Mot de passe incorrect' :
               'Échec de l\'authentification'
    });
  }
};


exports.login = login;

