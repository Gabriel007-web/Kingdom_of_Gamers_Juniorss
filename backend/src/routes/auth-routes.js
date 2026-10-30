const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const { authController } = require('../controllers/auth-controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const { asyncHandler } = require('../utils/async-handler');
const { schemas } = require('../validation/schemas');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });

router.post('/register', limiter, validate(schemas.register), asyncHandler(authController.register));
router.post('/login', limiter, validate(schemas.login), asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.me));

module.exports = router;
