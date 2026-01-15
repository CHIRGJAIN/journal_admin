const editorialBoardService = require('../services/editorialBoard.service');

const success = (res, data, message = 'Success') =>
  res.status(200).json({ status: true, message, data });
const error = (res, err) =>
  res.status(err.statusCode || 500).json({ status: false, message: err.message });

const createMember = async (req, res) => {
  try {
    const member = await editorialBoardService.createMember(req.body, req.user);
    return success(res, member, 'Editorial board member created');
  } catch (err) {
    return error(res, err);
  }
};

const getMembers = async (req, res) => {
  try {
    const filter = {};
    const pagination = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.limit) pagination.limit = parseInt(req.query.limit, 10);
    if (req.query.skip) pagination.skip = parseInt(req.query.skip, 10);

    const members = await editorialBoardService.getMembers(filter, pagination);
    return success(res, members, 'Editorial board list fetched');
  } catch (err) {
    return error(res, err);
  }
};

const getMember = async (req, res) => {
  try {
    const member = await editorialBoardService.getMemberById(req.params.id);
    return success(res, member, 'Editorial board member fetched');
  } catch (err) {
    return error(res, err);
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await editorialBoardService.updateMember(req.params.id, req.body);
    return success(res, member, 'Editorial board member updated');
  } catch (err) {
    return error(res, err);
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await editorialBoardService.deleteMember(req.params.id);
    return success(res, member, 'Editorial board member deleted');
  } catch (err) {
    return error(res, err);
  }
};

module.exports = {
  createMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
};
