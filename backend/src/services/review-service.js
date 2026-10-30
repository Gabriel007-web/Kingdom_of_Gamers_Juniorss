const { reviewModel } = require('../models/review-model');
const { gameModel } = require('../models/game-model');
const { libraryModel } = require('../models/library-model');
const { HttpError } = require('../utils/http-error');

const reviewService = {
  async list(slug) {
    const game = await gameModel.findBySlug(slug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado.');
    return reviewModel.listForGame(game.id);
  },
  async save(userId, slug, rating, comment) {
    const game = await gameModel.findBySlug(slug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado.');
    if (!(await libraryModel.hasGame(userId, game.id))) {
      throw new HttpError(403, 'OWNERSHIP_REQUIRED', 'Somente quem possui o jogo pode avaliá-lo.');
    }
    return reviewModel.save(userId, game.id, rating, comment);
  },
};

module.exports = { reviewService };
