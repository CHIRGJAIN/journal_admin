const contactMessageService = require('../services/contactMessage.service');

const createMessage = async (req, res) => {
  const message = await contactMessageService.createMessage(req.body);
  res.status(201).json({ status: true, data: message, message: 'Message received' });
};

const getMessages = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }

  const { data, total } = await contactMessageService.getMessages(filter, { skip, limit });

  res.json({
    status: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = {
  createMessage,
  getMessages,
};
