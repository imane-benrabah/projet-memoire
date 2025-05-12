class Rapport {
    constructor(pool) {
        this.pool = pool;
    }

    async create(titre, idB) {
        const [result] = await this.pool.query(
            'INSERT INTO Rapport (titre, idB) VALUES (?, ?)',
            [titre, idB]
        );
        return result.insertId;
    }

    async createRapportTache(idR) {
        await this.pool.query(
            'INSERT INTO RapportTâches (idR) VALUES (?)',
            [idR]
        );
    }
}

module.exports = Rapport;
