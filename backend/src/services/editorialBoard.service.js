const { EditorialBoard } = require('../models/EditorialBoard.model');
const { HttpError } = require('../utils/http-error');

const createMember = async (data, user) => {
  const { name, role, institution } = data;
  if (!name || !role || !institution) {
    throw new HttpError(400, 'Missing required fields');
  }

  const member = new EditorialBoard({
    ...data,
    createdBy: user ? user.userId : undefined,
  });

  return member.save();
};

const getMembers = async (filter = {}, pagination = {}) => {
  const query = EditorialBoard.find(filter);
  if (pagination.limit) query.limit(pagination.limit);
  if (pagination.skip) query.skip(pagination.skip);
  return query.sort({ createdAt: -1 });
};

const getMemberById = async (id) => {
  const member = await EditorialBoard.findById(id);
  if (!member) throw new HttpError(404, 'Editorial board member not found');
  return member;
};

const updateMember = async (id, data) => {
  const member = await EditorialBoard.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!member) throw new HttpError(404, 'Editorial board member not found');
  return member;
};

const deleteMember = async (id) => {
  const member = await EditorialBoard.findById(id);
  if (!member) throw new HttpError(404, 'Editorial board member not found');
  member.isActive = false;
  await member.save();
  return member;
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
