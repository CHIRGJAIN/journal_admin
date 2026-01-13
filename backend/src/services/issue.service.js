const Issue = require('../models/Issue.model');
const Manuscript = require('../models/manuscript.model').Manuscript;
const { isValidObjectId } = require('../utils/object-id');
const { generateSlug } = require('../utils/slug-generator');

const createIssue = async (data, user) => {
  const { volume, issueNumber, title, description,keywords, publicationDate, coverImage } = data;
  if (!volume || !issueNumber || !title) throw new Error('Missing required fields');
  const exists = await Issue.findOne({ volume, issueNumber });
  if (exists) throw new Error('Issue already exists for this volume and number');
  
  // Generate slug from title
  const slug = generateSlug(title);
  
  // Check if slug already exists
  const slugExists = await Issue.findOne({ slug });
  if (slugExists) throw new Error('An issue with this title already exists');
  
  const issue = await Issue.create({
    volume,
    issueNumber,
    title,
    slug,
    keywords,
    description,
    publicationDate,
    // coverImage,
    createdBy: user._id,
  });
  return issue;
};

const updateIssue = async (issueId, data) => {
  if (!isValidObjectId(issueId)) throw new Error('Invalid issueId');
  const issue = await Issue.findById(issueId);
  if (!issue) throw new Error('Issue not found');
  if (issue.status === 'ARCHIVED') throw new Error('Archived issues cannot be updated');
  if (issue.status === 'PUBLISHED') throw new Error('Published issues cannot be edited');
  Object.assign(issue, data);
  await issue.save();
  return issue;
};

const publishIssue = async (issueId) => {
  if (!isValidObjectId(issueId)) throw new Error('Invalid issueId');
  const issue = await Issue.findById(issueId);
  if (!issue) throw new Error('Issue not found');
  if (issue.status === 'ARCHIVED') throw new Error('Archived issues cannot be published');
  if (!issue.manuscripts || issue.manuscripts.length === 0) throw new Error('Cannot publish issue without manuscripts');
  const acceptedCount = await Manuscript.countDocuments({ _id: { $in: issue.manuscripts }, status: 'ACCEPTED' });
  if (acceptedCount === 0) throw new Error('At least one ACCEPTED manuscript required to publish');
  issue.status = 'PUBLISHED';
  await issue.save();
  return issue;
};

const getAllIssues = async ({ page = 1, limit = 10, year, volume, status } = {}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (volume) {
    filter.volume = Number(volume);
  }

  if (year) {
    const y = Number(year);
    if (!Number.isNaN(y)) {
      const start = new Date(Date.UTC(y, 0, 1));
      const end = new Date(Date.UTC(y + 1, 0, 1));
      filter.publicationDate = { $gte: start, $lt: end };
    }
  }

  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));
  const cappedLimit = Math.max(1, Math.min(Number(limit) || 10, 100));

  const query = Issue.find(filter)
    .populate('manuscripts')
    .sort({ publicationDate: -1 })
    .skip(skip)
    .limit(cappedLimit);

  const [data, total] = await Promise.all([
    query.exec(),
    Issue.countDocuments(filter),
  ]);

  return { data, total, page: Number(page) || 1, limit: cappedLimit };
};

const getLatestIssue = async () => {
  const issues = await Issue.find({ status: 'PUBLISHED' })
    // .populate('manuscripts')
    .sort({ publicationDate: -1 })
    .limit(10);
  if (!issues || issues.length === 0) throw new Error('No published issues found');
  return issues;
};

const getSingleIssue = async (issueId) => {
  if (!isValidObjectId(issueId)) throw new Error('Invalid issueId');
  const issue = await Issue.findById(issueId).populate('manuscripts');
  if (!issue) throw new Error('Issue not found');
  return issue;
};

const getIssueBySlug = async (slug) => {
  const issue = await Issue.findOne({ slug }).populate('manuscripts');
  if (!issue) throw new Error('Issue not found');
  return issue;
};

const getFeaturedManuscripts = async () => {
  // Get all published issues with manuscripts
  const issues = await Issue.find({ status: 'PUBLISHED' })
    .populate('manuscripts')
    .sort({ publicationDate: -1 });
  
  if (!issues || issues.length === 0) return [];
  
  const featuredManuscripts = [];
  
  // Get up to 6 manuscripts from each issue
  issues.forEach(issue => {
    if (issue.manuscripts && issue.manuscripts.length > 0) {
      const manuscriptsToAdd = issue.manuscripts.slice(0, 6).map(manuscript => ({
        ...manuscript.toObject(),
        issueVolume: issue.volume,
        issueNumber: issue.issueNumber,
        issueTitle: issue.title,
        issueSlug: issue.slug,
      }));
      featuredManuscripts.push(...manuscriptsToAdd);
    }
  });
  
  return featuredManuscripts;
};

const addManuscript = async (issueId, manuscriptId) => {
  if (!isValidObjectId(issueId) || !isValidObjectId(manuscriptId)) throw new Error('Invalid IDs');
  const issue = await Issue.findById(issueId);
  if (!issue) throw new Error('Issue not found');
  if (issue.status === 'ARCHIVED') throw new Error('Archived issues cannot be modified');
  if (issue.status === 'PUBLISHED') throw new Error('Published issues cannot be edited');
  if (issue.manuscripts.includes(manuscriptId)) throw new Error('Manuscript already added');
  const manuscript = await Manuscript.findById(manuscriptId);
  if (!manuscript || manuscript.status !== 'ACCEPTED') throw new Error('Only ACCEPTED manuscripts can be added');
  
  issue.manuscripts.push(manuscriptId);
  
  // Add the manuscript's total page count to the issue's total pages
  issue.totalPages = (issue.totalPages || 0) + (manuscript.totalPageCount || 0);
  
  await issue.save();
  return issue;
};

const removeManuscript = async (issueId, manuscriptId) => {
  if (!isValidObjectId(issueId) || !isValidObjectId(manuscriptId)) throw new Error('Invalid IDs');
  const issue = await Issue.findById(issueId);
  if (!issue) throw new Error('Issue not found');
  if (issue.status === 'ARCHIVED') throw new Error('Archived issues cannot be modified');
  if (issue.status === 'PUBLISHED') throw new Error('Published issues cannot be edited');
  
  // Get the manuscript to subtract its page count
  const manuscript = await Manuscript.findById(manuscriptId);
  if (manuscript) {
    issue.totalPages = Math.max(0, (issue.totalPages || 0) - (manuscript.totalPageCount || 0));
  }
  
  issue.manuscripts = issue.manuscripts.filter(id => id.toString() !== manuscriptId);
  await issue.save();
  return issue;
};

const archiveIssue = async (issueId) => {
  if (!isValidObjectId(issueId)) throw new Error('Invalid issueId');
  const issue = await Issue.findById(issueId);
  if (!issue) throw new Error('Issue not found');
  if (issue.status === 'ARCHIVED') throw new Error('Issue already archived');
  issue.status = 'ARCHIVED';
  issue.isActive = false;
  await issue.save();
  return issue;
};

const deleteIssue = async (issueId) => {
  if (!isValidObjectId(issueId)) throw new Error('Invalid issueId');
  const issue = await Issue.findById(issueId);
  if (!issue) throw new Error('Issue not found');
  await issue.deleteOne();
  return true;
};

module.exports = {
  createIssue,
  updateIssue,
  publishIssue,
  getAllIssues,
  getLatestIssue,
  getSingleIssue,
  getIssueBySlug,
  getFeaturedManuscripts,
  addManuscript,
  removeManuscript,
  archiveIssue,
  deleteIssue,
};
