const { config } = require('../config/env');
const { HttpError } = require('../utils/http-error');

function verifyRequestOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !config.frontendOrigins.includes(origin)) {
    return next(new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Origem não autorizada.'));
  }
  next();
}

module.exports = { verifyRequestOrigin };
