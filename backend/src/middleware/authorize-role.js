const { HttpError } = require('../utils/http-error');

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'FORBIDDEN', 'Você não tem permissão para esta ação.'));
    }
    next();
  };
}

module.exports = { authorizeRole };
