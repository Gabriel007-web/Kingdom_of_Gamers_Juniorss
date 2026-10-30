const { authService } = require('../services/auth-service');
const { sessionModel } = require('../models/session-model');
const { userModel } = require('../models/user-model');
const { COOKIE_NAME, hashToken } = require('../middleware/authenticate');
const { config } = require('../config/env');

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    displayName: user.display_name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    createdAt: user.created_at,
  };
}

function setSessionCookie(res, session) {
  res.cookie(COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: config.secureCookies,
    sameSite: 'lax',
    path: '/',
    expires: session.expiresAt,
  });
}

const authController = {
  async register(req, res) {
    const result = await authService.register(req.validated.body);
    setSessionCookie(res, result.session);
    res.status(201).json({ data: { user: publicUser(result.user) } });
  },
  async login(req, res) {
    const result = await authService.login(req.validated.body);
    setSessionCookie(res, result.session);
    res.json({ data: { user: publicUser(result.user) } });
  },
  async logout(req, res) {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) await sessionModel.delete(hashToken(token));
    res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: config.secureCookies, sameSite: 'lax', path: '/' });
    res.json({ data: { loggedOut: true } });
  },
  async me(req, res) {
    const user = await userModel.findPublicById(req.user.id);
    res.json({ data: { user: publicUser(user) } });
  },
};

module.exports = { authController, publicUser };
