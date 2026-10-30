const { pool } = require('../db/pool');

const contactModel = {
  async create({ name, email, subject, message }) {
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, subject, status, created_at`,
      [name, email, subject, message],
    );
    return result.rows[0];
  },
};

module.exports = { contactModel };
