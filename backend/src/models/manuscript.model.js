const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('./model-utils');

const fileItemSchema = new mongoose.Schema(
  {
    itemTitle: {
      type: String,
      required: true,
    },
    itemDescription: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true, // original file name
    },
    fileUrl: {
      type: String,
      required: true, // S3 / Cloudinary / local path
    },
    pageCount: {
      type: Number,
      default: 0, // Number of pages (for PDFs), 0 for non-PDF files
    },
  },
  { _id: false }
);
const manuscriptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    abstract: { type: String, required: true },
 
    status: {
      type: String,
      default: 'DRAFT',
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'REVISION_REQUESTED',
        'ACCEPTED',
        'REJECTED',
        'PUBLISHED',
      ],
    },
    type:{ type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 🔹 MULTIPLE WORD FILES
    files: {
      type: [fileItemSchema],
      required: true,
      validate: [(v) => v.length > 2, "At least 3 files are required"],
    },
    totalPageCount: {
      type: Number,
      default: 0, // Total page count across all PDF files
    },
    imageUrl: { type: String },
    comment: { type: String },
    keywords: { type: [String] },
    authorList:{ 
      fname: { type: String, required: true },
      mname: { type: String, required: true },
      lname: { type: String, required: true },
      degrees: { type: String},
      email: { type: String, required: true},
      orcid: { type: String},
      institution: { type: String,required: true},
      country: { type: String},
      contributorRole: { type: String,required: true},
     },
  },
  {
    timestamps: true,
  }
);

manuscriptSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

manuscriptSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'manuscriptId',
});



applyBaseSchemaOptions(manuscriptSchema);

const Manuscript = mongoose.model('Manuscript', manuscriptSchema);

module.exports = { Manuscript };
