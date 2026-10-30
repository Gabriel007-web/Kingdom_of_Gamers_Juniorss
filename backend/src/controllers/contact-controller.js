const { contactService } = require('../services/contact-service');

const contactController = {
  async create(req, res) {
    const message = await contactService.create(req.validated.body);
    res.status(201).json({ data: { id: message.id, status: message.status, createdAt: message.created_at } });
  },
};

module.exports = { contactController };
