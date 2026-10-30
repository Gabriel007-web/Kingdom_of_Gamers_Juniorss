const router = require('express').Router();
const { gameController } = require('../controllers/game-controller');
const { reviewController } = require('../controllers/review-controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const { asyncHandler } = require('../utils/async-handler');
const { schemas } = require('../validation/schemas');

router.get('/', validate(schemas.gameQuery, 'query'), asyncHandler(gameController.list));
router.get('/featured', asyncHandler(gameController.featured));
router.get('/recent', asyncHandler(gameController.recent));
router.get('/upcoming', asyncHandler(gameController.upcoming));
router.get('/:slug/reviews', validate(schemas.gameSlug, 'params'), asyncHandler(reviewController.list));
router.post('/:slug/reviews', authenticate, validate(schemas.gameSlug, 'params'), validate(schemas.review), asyncHandler(reviewController.save));
router.get('/:slug', validate(schemas.gameSlug, 'params'), asyncHandler(gameController.get));

module.exports = router;
