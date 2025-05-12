class Tache {
    constructor(pool) {
        this.pool = pool;
    }

    async getByEtudiant(idEtudiant) {
        // 1. Get binome ID
        const [binome] = await this.pool.query(
            'SELECT idB FROM Etudiant WHERE idU = ?',
            [idEtudiant]
        );
        
        if (binome.length === 0) return [];
        
        // 2. Get groupe ID
        const [groupe] = await this.pool.query(
            'SELECT idG FROM Binome WHERE idB = ?',
            [binome[0].idB]
        );
        
        if (groupe.length === 0) return [];
        
        // 3. Get sujet ID
        const [sujet] = await this.pool.query(
            'SELECT idS FROM Groupe WHERE idG = ?',
            [groupe[0].idG]
        );
        
        if (sujet.length === 0) return [];
        
        // 4. Get all tasks for this sujet
        const [taches] = await this.pool.query(`
            SELECT t.* 
            FROM Tache t
            JOIN Etape e ON t.idEtape = e.idEtape
            WHERE e.idS = ?
            ORDER BY t.dateDebut
        `, [sujet[0].idS]);
        
        return taches;
    }

    async linkToRapport(idTache, idR) {
        await this.pool.query(
            'UPDATE Tache SET idR = ? WHERE idTache = ?',
            [idR, idTache]
        );
    }
}

module.exports = Tache;