
const manuscriptsService = require('../services/manuscripts.service');
const { uploadFileToGCS } = require('../utils/gcs');
const { getPageCount } = require('../utils/pdf-parser');

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
  const authorId = req.user.userId;
  const { body, files } = req;

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
  const manuscripts = await manuscriptsService.findMyManuscripts(req.user.userId);
  res.json({ status: true, data: manuscripts });
};

const findOne = async (req, res) => {
  const manuscript = await manuscriptsService.findOne(req.params.id);
  res.json({ status: true, data: manuscript });
};


const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const manuscript = await manuscriptsService.updateStatus(id, status);
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
  findOne,
  updateStatus,
};
