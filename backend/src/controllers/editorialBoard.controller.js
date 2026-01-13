
const editorialBoardService = require('../services/editorialBoard.service');

// Standard response helper
const success = (res, data, message = 'Success') => res.status(200).json({ status: true, message, data });
const error = (res, err) => res.status(err.statusCode || 500).json({ status: false, message: err.message });

const createEditorialBoard = async (req, res) => {
  try {
    const editorialBoard = await editorialBoardService.createEditorialBoard(req.body);
    return success(res, editorialBoard, 'Editorial Board member created');
  } catch (err) {
    return error(res, err);
  }
};

const getEditorialBoards = async (req, res) => {
  try {
    const filter = {};
    const pagination = {};
    if (req.query.isActive) filter.isActive = req.query.isActive === 'true';
    if (req.query.limit) pagination.limit = parseInt(req.query.limit);
    if (req.query.skip) pagination.skip = parseInt(req.query.skip);
    const editorialBoards = await editorialBoardService.getEditorialBoards(filter, pagination);
    return success(res, editorialBoards, 'Editorial Board list fetched');
  } catch (err) {
    return error(res, err);
  }
};

const getEditorialBoard = async (req, res) => {
  try {
    const editorialBoard = await editorialBoardService.getEditorialBoardById(req.params.id);
    return success(res, editorialBoard, 'Editorial Board member fetched');
  } catch (err) {
    return error(res, err);
  }
};

const updateEditorialBoard = async (req, res) => {
  try {
    const editorialBoard = await editorialBoardService.updateEditorialBoard(req.params.id, req.body);
    return success(res, editorialBoard, 'Editorial Board member updated');
  } catch (err) {
    return error(res, err);
  }
};

const deleteEditorialBoard = async (req, res) => {
  try {
    const editorialBoard = await editorialBoardService.deleteEditorialBoard(req.params.id);
    return success(res, editorialBoard, 'Editorial Board member deleted');
  } catch (err) {
    return error(res, err);
  }
};

module.exports = {
  createEditorialBoard,
  getEditorialBoards,
  getEditorialBoard,
  updateEditorialBoard,
  deleteEditorialBoard
};
