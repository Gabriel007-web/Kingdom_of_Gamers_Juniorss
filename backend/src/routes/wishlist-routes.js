const router = require('express').Router();
const { wishlistController } = require('../controllers/wishlist-controller');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { schemas } = require('../validation/schemas');

router.use(authenticate);
router.get('/', asyncHandler(wishlistController.list));
router.post('/:slug', validate(schemas.userGameSlug, 'params'), asyncHandler(wishlistController.add));
router.delete('/:slug', validate(schemas.userGameSlug, 'params'), asyncHandler(wishlistController.remove));

module.exports = router;
