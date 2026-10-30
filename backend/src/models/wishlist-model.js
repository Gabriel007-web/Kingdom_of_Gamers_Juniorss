const { pool } = require('../db/pool');

const wishlistModel = {
  async list(userId) {
    const result = await pool.query(
      `SELECT g.id, g.slug, g.name, g.description, c.name AS category_name, c.slug AS category_slug,
        g.genre, g.platforms, g.price_cents, g.price_label, g.cover_image, wi.created_at
       FROM wishlist_items wi JOIN games g ON g.id = wi.game_id JOIN categories c ON c.id = g.category_id
       WHERE wi.user_id = $1 AND g.is_published = TRUE ORDER BY wi.created_at DESC`, [userId],
    );
    return result.rows;
  },
  async add(userId, gameId) {
    const result = await pool.query(
      `INSERT INTO wishlist_items (user_id, game_id)
       SELECT $1, id FROM games WHERE id = $2 AND is_published = TRUE
       ON CONFLICT (user_id, game_id) DO NOTHING RETURNING game_id`, [userId, gameId],
    );
    return result.rowCount > 0;
  },
  async remove(userId, gameId) {
    const result = await pool.query('DELETE FROM wishlist_items WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
    return result.rowCount > 0;
  },
};

module.exports = { wishlistModel };
