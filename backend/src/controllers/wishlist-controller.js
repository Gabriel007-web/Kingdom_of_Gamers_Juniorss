const { wishlistService } = require('../services/wishlist-service');

const wishlistController = {
  async list(req, res) { res.json({ data: await wishlistService.list(req.user.id) }); },
  async add(req, res) { res.status(201).json({ data: await wishlistService.add(req.user.id, req.params.slug) }); },
  async remove(req, res) { res.json({ data: { removed: await wishlistService.remove(req.user.id, req.params.slug) } }); },
};

module.exports = { wishlistController };
