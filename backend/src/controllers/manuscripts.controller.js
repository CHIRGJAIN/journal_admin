
const manuscriptsService = require('../services/manuscripts.service');
const usersService = require('../services/users.service');
const { uploadFileToGCS } = require('../utils/gcs');
const { getPageCount } = require('../utils/pdf-parser');
const { HttpError } = require('../utils/http-error');

const normalizeRoles = (roles) => (Array.isArray(roles) ? roles : [roles]);

const buildAuthorListFromUser = (user) => {
  const rawName = (user && user.name) || 'Author';
  const nameParts = rawName.split(/\s+/).filter(Boolean);
  const fname = nameParts[0] || 'Author';
  const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Team';
  const middleParts = nameParts.slice(1, -1);
  const mname = middleParts.join(' ') || '-';

  return {
    fname,
    mname,
    lname,
    degrees: '',
    email: (user && user.email) || 'author@example.com',
    orcid: '',
    institution: 'Unknown Institution',
    country: '',
    contributorRole: 'Author',
  };
};

const extractAuthorListFromBody = (body) => {
  if (body.authorList && typeof body.authorList === 'object') {
    return body.authorList;
  }

  const fields = [
    'fname',
    'mname',
    'lname',
    'degrees',
    'email',
    'orcid',
    'institution',
    'country',
    'contributorRole',
  ];

  const hasAny = fields.some((field) => body[`authorList.${field}`]);
  if (!hasAny) {
    return null;
  }

  return fields.reduce((acc, field) => {
    acc[field] = body[`authorList.${field}`];
    return acc;
  }, {});
};

const findAllPublic = async (req, res) => {
  // Get page and limit from query, default page=1, limit=10
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const q = req.query.q || '';
  const type = req.query.type || '';
  const issueSlug = req.query.issueSlug || '';

  const { data, total } = await manuscriptsService.searchPublished({ q, type, issueSlug, skip, limit });

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

// Legacy public list (kept separate for compatibility; delegates to same service)
const findAllPublicLegacy = async (req, res) => {
  return findAllPublic(req, res);
};

const getTypes = async (req, res) => {
  const types = await manuscriptsService.getTypes();
  res.json({ status: true, data: types, types });
};

const findOnePublic = async (req, res) => {
  const manuscript = await manuscriptsService.findOnePublished(req.params.id);
  res.json({ status: true, data: manuscript });
};


const create = async (req, res) => {
  const { body, files } = req;
  const roles = normalizeRoles(req.user.roles);
  let authorId = req.user.userId;

  if (roles.includes('publisher') || roles.includes('admin')) {
    const { authorId: requestedAuthorId, authorEmail } = body || {};
    if (requestedAuthorId || authorEmail) {
      const author =
        (requestedAuthorId && (await usersService.findById(requestedAuthorId))) ||
        (authorEmail && (await usersService.findByEmail(authorEmail)));
      if (!author) {
        throw new HttpError(400, 'Author not found');
      }
      authorId = author.id;

      if (!extractAuthorListFromBody(body)) {
        body.authorList = buildAuthorListFromUser(author);
      }
    }
  }

  const extractedAuthorList = extractAuthorListFromBody(body);
  if (extractedAuthorList) {
    body.authorList = extractedAuthorList;
  }

  // Upload manuscript files to GCS
  let fileItems = [];
  if (files && files.files) {
    // Expect itemTitle and itemDescription as arrays in body (itemTitle[], itemDescription[])
    const itemTitles = Array.isArray(body.itemTitle) ? body.itemTitle : [body.itemTitle];
    const itemDescriptions = Array.isArray(body.itemDescription) ? body.itemDescription : [body.itemDescription];

    fileItems = await Promise.all(files.files.map(async (file, idx) => {
      const gcsPath = `manuscripts/${Date.now()}_${file.originalname}`;
      const fileUrl = await uploadFileToGCS(file, gcsPath);
      
      // Get page count for PDF files
      const pageCount = await getPageCount(file.buffer, file.originalname);
      
      return {
        itemTitle: itemTitles[idx] || file.originalname,
        itemDescription: itemDescriptions[idx] || '',
        fileName: file.originalname,
        fileUrl,
        pageCount,
      };
    }));
  }

  // Upload image to GCS
  let imageUrl = '';
  if (files && files.image && files.image[0]) {
    const image = files.image[0];
    const gcsPath = `manuscripts/images/${Date.now()}_${image.originalname}`;
   
    imageUrl = await uploadFileToGCS(image, gcsPath);
  }

  // Prepare manuscript data
  const totalPageCount = fileItems.reduce((sum, file) => sum + file.pageCount, 0);
  const manuscriptData = {
    ...body,
    authorId,
    files: fileItems,
    imageUrl,
    totalPageCount,
  };

  delete manuscriptData.authorEmail;


  const manuscript = await manuscriptsService.createManuscript(manuscriptData);
  res.json({ status: true, data: manuscript });
};

const findAll = async (req, res) => {
  // Get page and limit from query, default page=1, limit=10
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get total count for meta
  const total = await manuscriptsService.countAll();
  const manuscripts = await manuscriptsService.findAll({ skip, limit });

  res.json({
    status: true,
    data: manuscripts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

const findMine = async (req, res) => {
  const statusFilter = req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) : null;
  const manuscripts = await manuscriptsService.findMyManuscripts(req.user.userId, statusFilter);
  res.json({ status: true, data: manuscripts });
};

const getSummary = async (req, res) => {
  const authorId = req.user.userId;
  const summary = await manuscriptsService.getSummaryForAuthor(authorId);
  res.json({ status: true, data: summary });
};

const findOne = async (req, res) => {
  const manuscript = await manuscriptsService.findOne(req.params.id);
  res.json({ status: true, data: manuscript });
};


const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const manuscript = await manuscriptsService.updateStatus(id, status);
  if (!manuscript) {
    throw new HttpError(404, 'Manuscript not found');
  }
  res.json({ status: true, data: manuscript });
};

const update = async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };

  if (req.file) {
    const gcsPath = `manuscripts/formatted/${Date.now()}_${req.file.originalname}`;
    payload.contentUrl = await uploadFileToGCS(req.file, gcsPath);
  }

  const allowedFields = [
    'title',
    'abstract',
    'status',
    'comment',
    'keywords',
    'type',
    'contentUrl',
    'imageUrl',
  ];
  const updateData = allowedFields.reduce((acc, key) => {
    if (payload[key] !== undefined) {
      acc[key] = payload[key];
    }
    return acc;
  }, {});

  const manuscript = await manuscriptsService.updateManuscript(id, updateData);
  if (!manuscript) {
    throw new HttpError(404, 'Manuscript not found');
  }
  res.json({ status: true, data: manuscript });
};

module.exports = {
  findAllPublic,
  findAllPublicLegacy,
  getTypes,
  findOnePublic,
  create,
  findAll,
  findMine,
  getSummary,
  findOne,
  updateStatus,
  update,
};
