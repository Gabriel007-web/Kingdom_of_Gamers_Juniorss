const router = require('express').Router();
const { pool } = require('../db/pool');
const { asyncHandler } = require('../utils/async-handler');

router.get('/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ data: { status: 'ok', database: 'connected' } });
}));
router.use('/auth', require('./auth-routes'));
router.use('/users', require('./user-routes'));
router.use('/games', require('./game-routes'));
router.use('/categories', require('./category-routes'));
router.use('/library', require('./library-routes'));
router.use('/wishlist', require('./wishlist-routes'));
router.use('/contact', require('./contact-routes'));

module.exports = router;
