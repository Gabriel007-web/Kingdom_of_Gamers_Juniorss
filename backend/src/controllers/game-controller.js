const { gameService } = require('../services/game-service');

const gameController = {
  async list(req, res) {
    const games = await gameService.list(req.validated.query);
    res.json({ data: games });
  },
  async featured(req, res) {
    res.json({ data: await gameService.featured() });
  },
  async recent(req, res) {
    res.json({ data: await gameService.recent() });
  },
  async upcoming(req, res) {
    res.json({ data: await gameService.upcoming() });
  },
  async get(req, res) {
    res.json({ data: await gameService.get(req.params.slug) });
  },
};

module.exports = { gameController };
