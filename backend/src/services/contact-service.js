const { contactModel } = require('../models/contact-model');

const contactService = {
  create(data) { return contactModel.create(data); },
};

module.exports = { contactService };
