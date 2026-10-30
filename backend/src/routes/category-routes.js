const router = require('express').Router();
const { categoryController } = require('../controllers/category-controller');
const { asyncHandler } = require('../utils/async-handler');

router.get('/', asyncHandler(categoryController.list));

module.exports = router;
