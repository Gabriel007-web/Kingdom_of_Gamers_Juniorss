const { pool } = require('../db/pool');

const libraryModel = {
  async list(userId) {
    const result = await pool.query(
      `SELECT g.id, g.slug, g.name, g.description, c.name AS category_name, c.slug AS category_slug,
        g.genre, g.platforms, g.price_cents, g.price_label, g.cover_image, li.acquired_at
       FROM library_items li JOIN games g ON g.id = li.game_id JOIN categories c ON c.id = g.category_id
       WHERE li.user_id = $1 ORDER BY li.acquired_at DESC`, [userId],
    );
    return result.rows;
  },
  async add(userId, gameId) {
    const result = await pool.query(
      `INSERT INTO library_items (user_id, game_id, source)
       SELECT $1, g.id, CASE WHEN g.price_cents = 0 THEN 'free' ELSE 'purchase' END
       FROM games g WHERE g.id = $2 AND g.is_published = TRUE AND g.release_status = 'released'
         AND (g.price_cents = 0 OR EXISTS (
           SELECT 1 FROM purchases p WHERE p.user_id = $1 AND p.game_id = g.id AND p.status = 'paid'
         ))
       ON CONFLICT (user_id, game_id) DO NOTHING RETURNING game_id`, [userId, gameId],
    );
    return result.rowCount > 0;
  },
  async hasGame(userId, gameId) {
    const result = await pool.query('SELECT 1 FROM library_items WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
    return result.rowCount > 0;
  },
};

module.exports = { libraryModel };
