const router = require('express').Router();
const { libraryController } = require('../controllers/library-controller');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { schemas } = require('../validation/schemas');

router.use(authenticate);
router.get('/', asyncHandler(libraryController.list));
router.post('/:slug', validate(schemas.userGameSlug, 'params'), asyncHandler(libraryController.add));

module.exports = router;
