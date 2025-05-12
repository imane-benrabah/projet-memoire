class VersionRapport {
    constructor(pool) {
        this.pool = pool;
    }

    async create(description, lien, idR) {
        await this.pool.query(
            'INSERT INTO VersionRapport (description, lien, idR) VALUES (?, ?, ?)',
            [description, lien, idR]
        );
    }
}

module.exports = VersionRapport;