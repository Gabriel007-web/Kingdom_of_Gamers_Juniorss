const { userModel } = require('../models/user-model');
const { publicUser } = require('./auth-controller');
const { HttpError } = require('../utils/http-error');

const userController = {
  async me(req, res) {
    const user = await userModel.findPublicById(req.user.id);
    if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
    res.json({ data: { user: publicUser(user) } });
  },
};

module.exports = { userController };
