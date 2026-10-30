const { pool } = require('../db/pool');

const userModel = {
  async create({ name, email, passwordHash }) {
    const result = await pool.query(
      `INSERT INTO users (name, display_name, email, password_hash)
       VALUES ($1, $1, $2, $3)
       RETURNING id, name, display_name, email, role, profile, created_at`,
      [name, email, passwordHash],
    );
    return result.rows[0];
  },
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return result.rows[0] || null;
  },
  async findPublicById(id) {
    const result = await pool.query(
      'SELECT id, name, display_name, email, role, profile, created_at FROM users WHERE id = $1', [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = { userModel };
