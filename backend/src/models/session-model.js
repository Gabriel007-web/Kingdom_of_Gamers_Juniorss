const { pool } = require('../db/pool');

const sessionModel = {
  async create(userId, tokenHash, expiresAt) {
    await pool.query('INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [userId, tokenHash, expiresAt]);
  },
  async findActive(tokenHash) {
    const result = await pool.query(
      `SELECT u.id, u.name, u.display_name, u.email, u.role, u.profile, u.created_at
       FROM user_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`, [tokenHash],
    );
    return result.rows[0] ? { user: result.rows[0] } : null;
  },
  async delete(tokenHash) {
    await pool.query('DELETE FROM user_sessions WHERE token_hash = $1', [tokenHash]);
  },
};

module.exports = { sessionModel };
