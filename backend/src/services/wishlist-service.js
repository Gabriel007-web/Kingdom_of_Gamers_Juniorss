const { wishlistModel } = require('../models/wishlist-model');
const { gameModel } = require('../models/game-model');
const { HttpError } = require('../utils/http-error');

const wishlistService = {
  list(userId) { return wishlistModel.list(userId); },
  async add(userId, slug) {
    const game = await gameModel.findBySlug(slug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado.');
    const added = await wishlistModel.add(userId, game.id);
    return { added, alreadySaved: !added };
  },
  async remove(userId, slug) {
    const game = await gameModel.findBySlug(slug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado.');
    return wishlistModel.remove(userId, game.id);
  },
};

module.exports = { wishlistService };
