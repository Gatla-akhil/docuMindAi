const mongoose = require('mongoose');

const TableCellSchema = new mongoose.Schema({
  header: String,
  value: String
}, { _id: false });

const TableRowSchema = new mongoose.Schema({
  cells: [TableCellSchema]
}, { _id: false });

const ExtractedTableSchema = new mongoose.Schema({
  title: { type: String, default: 'Extracted Table' },
  headers: [String],
  rows: [[String]]
}, { _id: false });

const DocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    textExtracted: {
      type: String,
      default: ''
    },
    ocrApplied: {
      type: Boolean,
      default: false
    },
    fileCategory: {
      type: String,
      enum: ['Invoice', 'Receipt', 'Contract', 'Tax Document', 'Identity ID', 'Report', 'General'],
      default: 'General'
    },
    extractedEntities: {
      names: [{ type: String }],
      emails: [{ type: String }],
      phoneNumbers: [{ type: String }],
      addresses: [{ type: String }],
      dates: [{ type: String }],
      invoiceNumbers: [{ type: String }],
      gstNumbers: [{ type: String }],
      panNumbers: [{ type: String }],
      amounts: [{ type: String }],
      tables: [ExtractedTableSchema]
    },
    summary: {
      type: String,
      default: ''
    },
    keywords: [{ type: String }],
    classification: {
      category: { type: String, default: 'General' },
      confidence: { type: Number, default: 0.9 },
      sentiment: { type: String, default: 'Neutral' }
    },
    riskFlags: [
      {
        severity: { type: String, enum: ['Low', 'Medium', 'High'] },
        issue: { type: String },
        description: { type: String }
      }
    ],
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing'
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

DocumentSchema.index({ title: 'text', textExtracted: 'text', summary: 'text' });

module.exports = mongoose.model('Document', DocumentSchema);
