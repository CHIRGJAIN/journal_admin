/**
 * Generate a slug from a string
 * @param {string} str - The string to convert to slug
 * @returns {string} - URL-friendly slug
 */
const generateSlug = (str) => {
  return str
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

module.exports = {
  generateSlug,
};
