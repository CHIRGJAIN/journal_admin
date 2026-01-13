const pdfParse = require('pdf-parse');

/**
 * Extract page count from PDF file
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The original file name
 * @returns {Promise<number>} - Number of pages (returns 0 for non-PDF files)
 */
const getPageCount = async (fileBuffer, fileName) => {
  try {
    // Check if file is PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return 0; // Return 0 for non-PDF files
    }

    const pdfData = await pdfParse(fileBuffer);
    return pdfData.numpages || 0;
  } catch (error) {
    console.error('Error parsing PDF:', error.message);
    return 0; // Return 0 if parsing fails
  }
};

module.exports = {
  getPageCount,
};
