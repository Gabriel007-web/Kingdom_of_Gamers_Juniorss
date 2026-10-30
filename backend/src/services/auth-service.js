const { randomBytes } = require('node:crypto');
const argon2 = require('argon2');
const { userModel } = require('../models/user-model');
const { sessionModel } = require('../models/session-model');
const { config } = require('../config/env');
const { hashToken } = require('../middleware/authenticate');
const { HttpError } = require('../utils/http-error');

async function createSession(user) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000);
  await sessionModel.create(user.id, hashToken(token), expiresAt);
  return { token, expiresAt };
}

const authService = {
  async register({ name, email, password }) {
    if (await userModel.findByEmail(email)) throw new HttpError(409, 'EMAIL_IN_USE', 'Este e-mail já está cadastrado.');
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await userModel.create({ name, email, passwordHash });
    return { user, session: await createSession(user) };
  },
  async login({ email, password }) {
    const user = await userModel.findByEmail(email);
    const senhaValida = user && await argon2.verify(user.password_hash, password);
    if (!senhaValida) throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.');
    const { password_hash: _, ...publicUser } = user;
    return { user: publicUser, session: await createSession(user) };
  },
};

module.exports = { authService };
