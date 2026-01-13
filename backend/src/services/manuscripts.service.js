const updateStatus = async (id, status) => {
  if (!isValidObjectId(id)) return null;
  return Manuscript.findByIdAndUpdate(id, { status }, { new: true }).exec();
};
const { Manuscript } = require('../models/manuscript.model');
const Issue = require('../models/Issue.model');
const { isValidObjectId } = require('../utils/object-id');

const createManuscript = async (data) => {
  const manuscript = await Manuscript.create(data);
  return manuscript;
};


const findAll = async ({ skip = 0, limit = 10 } = {}) =>
  Manuscript.find()
    .skip(skip)
    .limit(limit)
    .populate('author', 'name email')
    .exec();

const countAll = async () => Manuscript.countDocuments();


const findAllPublished = async ({ skip = 0, limit = 10 } = {}) =>
  Manuscript.find({ status: 'PUBLISHED' })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name')
    .exec();

const countPublished = async () => Manuscript.countDocuments({ status: 'PUBLISHED' });

const searchPublished = async ({ q, type, issueSlug, skip = 0, limit = 10 } = {}) => {
  const filter = { status: { $in: ['PUBLISHED', 'ACCEPTED'] } };

  if (type) {
    filter.type = type;
  }

  if (q) {
    const regex = new RegExp(q, 'i');
    filter.$or = [{ title: regex }, { abstract: regex }, { keywords: regex }];
  }

  // If issueSlug provided, restrict to manuscripts attached to that issue
  let issueManuscriptIds = null;
  if (issueSlug) {
    const issue = await Issue.findById(issueSlug).select('manuscripts').lean();
   
    if (issue && Array.isArray(issue.manuscripts) && issue.manuscripts.length > 0) {
      issueManuscriptIds = issue.manuscripts.map((id) => id.toString());
      filter._id = { $in: issueManuscriptIds };

    } else {
      return { data: [], total: 0 };
    }
  }

  const query = Manuscript.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name');

  const [data, total] = await Promise.all([
    query.exec(),
    Manuscript.countDocuments(filter),
  ]);

  return { data, total };
};

const getTypes = async () => {
  const types = await Manuscript.distinct('type', { status: 'PUBLISHED' });
  return types;
};

const findOnePublished = async (id) => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return Manuscript.findOne({ _id: id})
    .populate('author', 'name')
    .exec();
};

const findMyManuscripts = async (authorId) =>
  Manuscript.find({ authorId }).exec();

const findOne = async (id) => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return Manuscript.findById(id)
    .populate('author', 'name email')
    .populate('reviews')
    .exec();
};

module.exports = {
  createManuscript,
  findAll,
  countAll,
  findAllPublished,
  countPublished,
  searchPublished,
  getTypes,
  findOnePublished,
  findMyManuscripts,
  findOne,
  updateStatus,
};
