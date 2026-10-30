const { createHash } = require('node:crypto');
const { sessionModel } = require('../models/session-model');
const { HttpError } = require('../utils/http-error');

const COOKIE_NAME = 'kgj_session';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new HttpError(401, 'AUTH_REQUIRED', 'Entre na sua conta para continuar.');
    const session = await sessionModel.findActive(hashToken(token));
    if (!session) throw new HttpError(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.');
    req.user = session.user;
    req.sessionTokenHash = hashToken(token);
    next();
  } catch (erro) {
    next(erro);
  }
}

module.exports = { authenticate, COOKIE_NAME, hashToken };
