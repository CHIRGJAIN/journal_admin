const Blog = require('../models/blog.model');
const { HttpError } = require('../utils/http-error');

async function createBlog(data) {
  const blog = new Blog(data);
  return await blog.save();
}

async function getBlogs(filter = {}, pagination = {}) {
  const query = Blog.find(filter);
  if (pagination.limit) query.limit(pagination.limit);
  if (pagination.skip) query.skip(pagination.skip);
  return await query.sort({ createdAt: -1 });
}

async function getBlogById(id) {
  const blog = await Blog.findById(id);
  if (!blog) throw new HttpError(404, 'Blog not found');
  return blog;
}

async function getBlogBySlug(slug) {
  const blog = await Blog.findOne({ slug });
  if (!blog) throw new HttpError(404, 'Blog not found');
  return blog;
}

async function updateBlog(id, data) {
  const blog = await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!blog) throw new HttpError(404, 'Blog not found');
  return blog;
}

async function deleteBlog(id) {
  const blog = await Blog.findById(id);
  if (!blog) throw new HttpError(404, 'Blog not found');
  blog.isActive = false;
  await blog.save();
  return blog;
}

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog
};
