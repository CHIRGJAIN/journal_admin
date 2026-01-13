const blogService = require('../services/blog.service');

const success = (res, data, message = 'Success') => res.status(200).json({ status: true, message, data });
const error = (res, err) => res.status(err.statusCode || 500).json({ status: false, message: err.message });

const createBlog = async (req, res) => {
  try {
    const blog = await blogService.createBlog(req.body);
    return success(res, blog, 'Blog created');
  } catch (err) {
    return error(res, err);
  }
};

const getBlogs = async (req, res) => {
  try {
    const filter = {};
    const pagination = {};
    if (req.query.isActive) filter.isActive = req.query.isActive === 'true';
    if (req.query.limit) pagination.limit = parseInt(req.query.limit);
    if (req.query.skip) pagination.skip = parseInt(req.query.skip);
    const blogs = await blogService.getBlogs(filter, pagination);
    return success(res, blogs, 'Blog list fetched');
  } catch (err) {
    return error(res, err);
  }
};

const getBlog = async (req, res) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    return success(res, blog, 'Blog fetched');
  } catch (err) {
    return error(res, err);
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await blogService.getBlogBySlug(req.params.slug);
    return success(res, blog, 'Blog fetched');
  } catch (err) {
    return error(res, err);
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await blogService.updateBlog(req.params.id, req.body);
    return success(res, blog, 'Blog updated');
  } catch (err) {
    return error(res, err);
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await blogService.deleteBlog(req.params.id);
    return success(res, blog, 'Blog deleted');
  } catch (err) {
    return error(res, err);
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  getBlogBySlug,
  updateBlog,
  deleteBlog
};
