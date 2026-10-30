const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const { contactController } = require('../controllers/contact-controller');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { config } = require('../config/env');
const { schemas } = require('../validation/schemas');

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.contactRateLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

router.post('/', contactLimiter, validate(schemas.contact), asyncHandler(contactController.create));

module.exports = router;
