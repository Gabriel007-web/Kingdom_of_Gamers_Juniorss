const { libraryService } = require('../services/library-service');

const libraryController = {
  async list(req, res) { res.json({ data: await libraryService.list(req.user.id) }); },
  async add(req, res) { res.status(201).json({ data: await libraryService.add(req.user.id, req.params.slug) }); },
};

module.exports = { libraryController };
