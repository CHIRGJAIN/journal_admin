const EditorialBoard = require('../models/EditorialBoard.model');
const { HttpError } = require('../utils/http-error');

async function createEditorialBoard(data) {
  const exists = await EditorialBoard.findOne({ email: data.email });
  if (exists) throw new HttpError(409, 'Email already exists');
  const editorialBoard = new EditorialBoard(data);
  return await editorialBoard.save();
}

async function getEditorialBoards(filter = {}, pagination = {}) {
  const query = EditorialBoard.find(filter);
  if (pagination.limit) query.limit(pagination.limit);
  if (pagination.skip) query.skip(pagination.skip);
  return await query.sort({ createdAt: -1 });
}

async function getEditorialBoardById(id) {
  const editorialBoard = await EditorialBoard.findById(id);
  if (!editorialBoard) throw new HttpError(404, 'Editorial Board member not found');
  return editorialBoard;
}

async function updateEditorialBoard(id, data) {
  const editorialBoard = await EditorialBoard.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!editorialBoard) throw new HttpError(404, 'Editorial Board member not found');
  return editorialBoard;
}

async function deleteEditorialBoard(id) {
  // Soft delete if isActive exists
  const editorialBoard = await EditorialBoard.findById(id);
  if (!editorialBoard) throw new HttpError(404, 'Editorial Board member not found');
  editorialBoard.isActive = false;
  await editorialBoard.save();
  return editorialBoard;
}

module.exports = {
  createEditorialBoard,
  getEditorialBoards,
  getEditorialBoardById,
  updateEditorialBoard,
  deleteEditorialBoard
};
