const { libraryModel } = require('../models/library-model');
const { gameModel } = require('../models/game-model');
const { HttpError } = require('../utils/http-error');

const libraryService = {
  list(userId) { return libraryModel.list(userId); },
  async add(userId, slug) {
    const game = await gameModel.findBySlug(slug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado.');
    if (await libraryModel.hasGame(userId, game.id)) return { added: false, alreadyOwned: true };
    const added = await libraryModel.add(userId, game.id);
    if (!added) throw new HttpError(403, 'PURCHASE_REQUIRED', 'É necessário ter uma compra aprovada para adicionar este jogo.');
    return { added: true, alreadyOwned: false };
  },
};

module.exports = { libraryService };
