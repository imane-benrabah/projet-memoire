const db = require('../config/dbWrapper');

module.exports = {
    checkCredentials: (email, password, callback) => {
        const sql = 'SELECT idC, email, password FROM Compte WHERE email = ?';
        db.mainDb.query(sql, [email], (err, results) => {
            if (err) return callback(err);
            
            if (results.length === 0) {
                return callback(new Error('Email incorrect'));
            }
            
            const user = results[0];
            if (password !== user.mot_de_passe) {
                return callback(new Error('Mot de passe incorrect'));
            }
            
            callback(null, user);
        });
    },

    getRoles: (userId, callback) => {
        // 1. Vérifier si admin
        db.mainDb.query('SELECT 1 FROM Administrateur WHERE idU = ? LIMIT 1', [userId], (err, adminResults) => {
            if (err) return callback(err);
            
            if (adminResults.length > 0) {
                return callback(null, { role: 'admin', type: null });
            }
            
            // 2. Vérifier si enseignant
            db.mainDb.query('SELECT 1 FROM Enseignant WHERE idU = ? LIMIT 1', [userId], (err, enseignantResults) => {
                if (err) return callback(err);
                
                if (enseignantResults.length > 0) {
                    // Vérifier les sous-rôles enseignant
                    db.mainDb.query('SELECT 1 FROM EnseignantPrincipal WHERE idU = ? LIMIT 1', [userId], (err, principalResults) => {
                        if (err) return callback(err);
                        
                        db.mainDb.query('SELECT 1 FROM EnseignantResponsable WHERE idU = ? LIMIT 1', [userId], (err, responsableResults) => {
                            if (err) return callback(err);
                            
                            const isPrincipal = principalResults.length > 0;
                            const isResponsable = responsableResults.length > 0;
                            
                            let type = 'standard';
                            if (isPrincipal && isResponsable) type = 'principal';
                            else if (isPrincipal) type = 'principal';
                            else if (isResponsable) type = 'responsable';
                            
                            return callback(null, { role: 'enseignant', type });
                        });
                    });
                } else {
                    // 3. Vérifier si étudiant
                    db.mainDb.query(
                        'SELECT b.responsabilite FROM Etudiant e LEFT JOIN Binome b ON e.idB = b.idB WHERE e.idU = ? LIMIT 1', 
                        [userId], 
                        (err, etudiantResults) => {
                            if (err) return callback(err);
                            
                            if (etudiantResults.length > 0) {
                                const responsabilite = etudiantResults[0].responsabilite || 'standard';
                                let type = 'standard';
                                
                                if (responsabilite === 'responsable memoire') type = 'responsable_memoire';
                                else if (responsabilite === 'responsable etape') type = 'responsable_etape';
                                
                                return callback(null, { role: 'etudiant', type });
                            }
                            
                            // Aucun rôle trouvé
                            callback(null, { role: 'unknown' });
                        }
                    );
                }
            });
        });
    }
};