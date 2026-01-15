const { ContactMessage } = require('../models/contactMessage.model');
const { HttpError } = require('../utils/http-error');

const createMessage = async (data) => {
  const { name, email, message, source } = data || {};

  if (!name || !email || !message) {
    throw new HttpError(400, 'Name, email, and message are required');
  }

  const contactMessage = new ContactMessage({
    name,
    email,
    message,
    source,
  });

  return contactMessage.save();
};

const getMessages = async (filter = {}, pagination = {}) => {
  const query = ContactMessage.find(filter).sort({ createdAt: -1 });
  if (pagination.limit) query.limit(pagination.limit);
  if (pagination.skip) query.skip(pagination.skip);

  const [data, total] = await Promise.all([
    query.exec(),
    ContactMessage.countDocuments(filter),
  ]);

  return { data, total };
};

module.exports = {
  createMessage,
  getMessages,
};
