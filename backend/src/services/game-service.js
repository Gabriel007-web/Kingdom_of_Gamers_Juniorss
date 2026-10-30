const { gameModel } = require('../models/game-model');
const { categoryModel } = require('../models/category-model');
const { HttpError } = require('../utils/http-error');

function serializeGame(game) {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    description: game.description,
    category: { name: game.category_name, slug: game.category_slug },
    genre: game.genre,
    platforms: game.platforms,
    priceCents: game.price_cents,
    priceLabel: game.price_label,
    rating: game.rating === null ? null : Number(game.rating),
    reviewCount: Number(game.review_count || 0),
    coverImage: game.cover_image,
    releaseDate: game.release_date,
    releaseStatus: game.release_status,
    featured: game.is_featured,
    createdAt: game.created_at,
  };
}

const gameService = {
  async list({ q, category, limit, offset, status, featured }) {
    if (category && !(await categoryModel.findBySlug(category))) return [];
    const games = await gameModel.list({ query: q, category, status, featured, limit, offset });
    return games.map(serializeGame);
  },
  async get(slug) {
    const game = await gameModel.findBySlug(slug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado.');
    return serializeGame(game);
  },
  async featured(limit = 12) {
    return (await gameModel.list({ limit, offset: 0, featured: true })).map(serializeGame);
  },
  async recent(limit = 12) {
    return (await gameModel.listRecent(limit)).map(serializeGame);
  },
  async upcoming(limit = 24) {
    return (await gameModel.listUpcoming(limit)).map(serializeGame);
  },
  serializeGame,
};

module.exports = { gameService };
