const { pool } = require('../db/pool');

const categoryModel = {
  async list() {
    const result = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, COUNT(g.id)::int AS game_count
       FROM categories c LEFT JOIN games g ON g.category_id = c.id AND g.is_published = TRUE
       GROUP BY c.id ORDER BY c.name`,
    );
    return result.rows;
  },
  async findBySlug(slug) {
    const result = await pool.query('SELECT id, name, slug FROM categories WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  },
};

module.exports = { categoryModel };
