const { pool } = require('../db/pool');

const selectGame = `
  SELECT g.id, g.slug, g.name, g.description, c.name AS category_name, c.slug AS category_slug,
    g.genre, g.platforms, g.price_cents, g.price_label,
    COALESCE((SELECT AVG(r.rating)::numeric(2,1) FROM reviews r WHERE r.game_id = g.id), g.rating_override) AS rating,
    (SELECT COUNT(*)::int FROM reviews r WHERE r.game_id = g.id) AS review_count,
    g.cover_image, g.release_date, g.release_status, g.is_featured, g.created_at
  FROM games g JOIN categories c ON c.id = g.category_id`;

const gameModel = {
  async list({ query, category, status, featured, limit, offset }) {
    const result = await pool.query(
      `${selectGame}
       WHERE g.is_published = TRUE
         AND ($1::text IS NULL OR c.slug = $1)
         AND ($2::text IS NULL OR g.release_status = $2)
         AND ($3::boolean IS NULL OR g.is_featured = $3)
         AND ($4::text IS NULL OR g.name ILIKE $4 OR g.description ILIKE $4 OR g.genre ILIKE $4
           OR TO_TSVECTOR('simple', g.name || ' ' || g.description || ' ' || g.genre)
             @@ PLAINTO_TSQUERY('simple', TRIM(BOTH '%' FROM $4)))
       ORDER BY CASE WHEN g.release_status = 'upcoming' THEN 1 ELSE 0 END,
         g.is_featured DESC, g.release_date DESC NULLS LAST, g.name ASC
       LIMIT $5 OFFSET $6`,
      [category || null, status || null, typeof featured === 'boolean' ? featured : null,
        query ? `%${query}%` : null, limit, offset],
    );
    return result.rows;
  },
  async findBySlug(slug) {
    const result = await pool.query(`${selectGame} WHERE g.slug = $1 AND g.is_published = TRUE`, [slug]);
    return result.rows[0] || null;
  },
  async listRecent(limit) {
    const result = await pool.query(
      `${selectGame} WHERE g.is_published = TRUE AND g.release_status = 'released' AND g.release_date IS NOT NULL
       ORDER BY g.release_date DESC LIMIT $1`, [limit],
    );
    return result.rows;
  },
  async listUpcoming(limit) {
    const result = await pool.query(
      `${selectGame} WHERE g.is_published = TRUE AND g.release_status = 'upcoming'
       ORDER BY g.release_date ASC NULLS LAST, g.name LIMIT $1`, [limit],
    );
    return result.rows;
  },
};

module.exports = { gameModel };
