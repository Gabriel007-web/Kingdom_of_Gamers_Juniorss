const { categoryService } = require('../services/category-service');

const categoryController = {
  async list(req, res) { res.json({ data: await categoryService.list() }); },
};

module.exports = { categoryController };
