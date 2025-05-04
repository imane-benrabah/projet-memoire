const db = require('../config/dbWrapper'); // Utilisez le wrapper au lieu de db directement

const checkCredentials = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Compte WHERE email = ?';
      db.mainDb.query(sql, [email], (err, results) => {
        if (err) return reject(err);
        
        const user = results[0];
  
        if (!user) {
          return reject(new Error('Email incorrect'));
        }
  
        if (user.password !== password) {
          return reject(new Error('Mot de passe incorrect'));
        }
  
        resolve(user);
      });
    });
  };
  
  
const getRoles = async (userId) => {
    try {
        if (!userId) {
            throw new Error('ID utilisateur manquant');
        }

        // Vérifier d'abord si c'est un admin
        const [adminResults] = await db.mainDb.query(
            'SELECT 1 FROM Administrateur WHERE idU = ? LIMIT 1', 
            [userId]
        ) || [];

        if (adminResults && adminResults.length > 0) {
            return { role: 'admin' };
        }

        // Vérifier si c'est un enseignant et ses rôles
        const [enseignantResults] = await db.mainDb.query(
            'SELECT 1 FROM Enseignant WHERE idU = ? LIMIT 1', 
            [userId]
        ) || [];

        if (enseignantResults && enseignantResults.length > 0) {
            const [responsableResults] = await db.mainDb.query(
                'SELECT 1 FROM EnseignantResponsable WHERE idU = ? LIMIT 1', 
                [userId]
            ) || [];

            const [principalResults] = await db.mainDb.query(
                'SELECT 1 FROM EnseignantPrincipal WHERE idU = ? LIMIT 1', 
                [userId]
            ) || [];

            const isResponsable = responsableResults && responsableResults.length > 0;
            const isPrincipal = principalResults && principalResults.length > 0;

            if (isResponsable && isPrincipal) {
                return { role: 'enseignant', type: 'principal' };
            }
            if (isResponsable) {
                return { role: 'enseignant', type: 'responsable' };
            }
            if (isPrincipal) {
                return { role: 'enseignant', type: 'principal' };
            }
            return { role: 'enseignant', type: 'standard' };
        }

        // Vérifier si c'est un étudiant et ses responsabilités
        const [etudiantResults] = await db.mainDb.query(
            'SELECT e.idB, b.responsabilite FROM Etudiant e LEFT JOIN Binome b ON e.idB = b.idB WHERE e.idU = ? LIMIT 1', 
            [userId]
        ) || [];

        if (etudiantResults && etudiantResults.length > 0) {
            const responsabilite = etudiantResults[0].responsabilite || 'standard';
            
            if (responsabilite === 'responsable memoire') {
                return { role: 'etudiant', type: 'responsable_memoire' };
            }
            if (responsabilite === 'responsable etape') {
                return { role: 'etudiant', type: 'responsable_etape' };
            }
            return { role: 'etudiant', type: 'standard' };
        }

        return { role: 'unknown' };

    } catch (err) {
        console.error('Erreur détaillée dans getRoles:', err);
        throw new Error(`Erreur lors de la récupération des rôles: ${err.message}`);
    }
};
module.exports = {
    checkCredentials,
    getRoles 
};