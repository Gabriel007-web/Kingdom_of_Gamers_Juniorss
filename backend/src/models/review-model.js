const { pool } = require('../db/pool');

const reviewModel = {
  async listForGame(gameId) {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.display_name AS user_name
       FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.game_id = $1
       ORDER BY r.created_at DESC LIMIT 100`, [gameId],
    );
    return result.rows;
  },
  async save(userId, gameId, rating, comment) {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, game_id, rating, comment)
       SELECT $1, $2, $3, $4 WHERE EXISTS (
         SELECT 1 FROM library_items WHERE user_id = $1 AND game_id = $2
       )
       ON CONFLICT (user_id, game_id) DO UPDATE SET rating = EXCLUDED.rating,
         comment = EXCLUDED.comment, updated_at = NOW()
       RETURNING id, user_id, game_id, rating, comment, created_at`,
      [userId, gameId, rating, comment],
    );
    return result.rows[0] || null;
  },
};

module.exports = { reviewModel };
