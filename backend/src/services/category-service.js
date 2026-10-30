const { categoryModel } = require('../models/category-model');

const categoryService = {
  list() { return categoryModel.list(); },
};

module.exports = { categoryService };
