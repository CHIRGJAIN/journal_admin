const issueService = require('../services/issue.service');

const createIssue = async (req, res) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user);
    res.status(201).json({ status: true, data: issue });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const updateIssue = async (req, res) => {
  try {
    const issue = await issueService.updateIssue(req.params.id, req.body);
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const publishIssue = async (req, res) => {
  try {
    const issue = await issueService.publishIssue(req.params.id);
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const getIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { year, volume, status } = req.query;

    const { data, total } = await issueService.getAllIssues({ page, limit, year, volume, status });

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
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const getLatestIssue = async (req, res) => {
  try {
    const issue = await issueService.getLatestIssue();
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(404).json({ status: false, error: err.message });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await issueService.getSingleIssue(req.params.id);
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const getIssueBySlug = async (req, res) => {
  try {
    const issue = await issueService.getIssueBySlug(req.params.slug);
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(404).json({ status: false, error: err.message });
  }
};

const getFeaturedManuscripts = async (req, res) => {
  try {
    const manuscripts = await issueService.getFeaturedManuscripts();
    res.json({ status: true, data: manuscripts });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const addManuscript = async (req, res) => {
  try {
    const issue = await issueService.addManuscript(req.params.id, req.body.manuscriptId);
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const removeManuscript = async (req, res) => {
  try {
    const issue = await issueService.removeManuscript(req.params.id, req.body.manuscriptId);
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const archiveIssue = async (req, res) => {
  try {
    const issue = await issueService.archiveIssue(req.params.id);
    res.json({ status: true, data: issue });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    await issueService.deleteIssue(req.params.id);
    res.json({ status: true, message: 'Issue deleted successfully' });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

module.exports = {
  createIssue,
  updateIssue,
  publishIssue,
  getIssues,
  getLatestIssue,
  getIssueById,
  getIssueBySlug,
  getFeaturedManuscripts,
  addManuscript,
  removeManuscript,
  archiveIssue,
  deleteIssue,
};

// Helper: Check role
const isAdminOrEditor = (user) => ['admin', 'editor'].includes(user.role);

// Helper: Check if issue is archived
const isArchived = (issue) => issue.status === 'ARCHIVED';

// Helper: Check for accepted manuscript
const hasAcceptedManuscript = async (manuscriptIds) => {
  const count = await Manuscript.countDocuments({
    _id: { $in: manuscriptIds },
    status: 'ACCEPTED',
  });
  return count > 0;
};
