const router = require('express').Router();
const { userController } = require('../controllers/user-controller');
const { authenticate } = require('../middleware/authenticate');
const { asyncHandler } = require('../utils/async-handler');

router.get('/me', authenticate, asyncHandler(userController.me));

module.exports = router;
