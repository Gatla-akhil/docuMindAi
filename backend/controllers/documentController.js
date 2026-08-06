const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { parseDocument } = require('../services/parserService');
const { analyzeDocumentWithGemini } = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Upload & auto-process document (PDF, DOCX, Image)
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No document file uploaded', 400);
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const { category } = req.body;

    // 1. Create document record in processing state
    const doc = await Document.create({
      user: req.user._id,
      originalName: originalname,
      filename,
      mimeType: mimetype,
      size,
      filePath,
      fileCategory: category || 'General',
      status: 'processing'
    });

    // 2. Parse text (PDF/DOCX/OCR)
    const { text, ocrApplied } = await parseDocument(filePath, mimetype);
    doc.textExtracted = text;
    doc.ocrApplied = ocrApplied;

    // 3. Perform AI analysis with Gemini / heuristic fallback
    const aiResults = await analyzeDocumentWithGemini(text, category || 'General');

    doc.summary = aiResults.summary || 'Summary unavailable.';
    doc.keywords = aiResults.keywords || [];
    doc.classification = aiResults.classification || { category: category || 'General', confidence: 0.9, sentiment: 'Neutral' };
    doc.fileCategory = aiResults.classification?.category || category || 'General';
    doc.extractedEntities = aiResults.extractedEntities || {
      names: [], emails: [], phoneNumbers: [], addresses: [], dates: [], invoiceNumbers: [], gstNumbers: [], panNumbers: [], amounts: [], tables: []
    };
    doc.riskFlags = aiResults.riskFlags || [];
    doc.status = 'completed';

    await doc.save();

    // Audit log
    await ActivityLog.create({
      user: req.user._id,
      action: 'DOCUMENT_UPLOAD',
      details: `Uploaded & parsed document '${originalname}' (${(size / 1024).toFixed(1)} KB)`,
      ipAddress: req.ip,
      meta: { documentId: doc._id }
    });

    return sendSuccess(res, 'Document uploaded and processed successfully', { document: doc }, 201);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Get user documents with pagination & filtering
 * @route   GET /api/documents
 * @access  Private
 */
const getDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { category, status } = req.query;

    const query = { user: req.user._id };
    if (category) query.fileCategory = category;
    if (status) query.status = status;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(query);

    return sendSuccess(res, 'Documents retrieved successfully', {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single document details
 * @route   GET /api/documents/:id
 * @access  Private
 */
const getDocumentById = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }
    return sendSuccess(res, 'Document details retrieved', { document: doc });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Re-analyze document with AI
 * @route   POST /api/documents/:id/reanalyze
 * @access  Private
 */
const reanalyzeDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }

    doc.status = 'processing';
    await doc.save();

    // Re-parse text if text is empty
    if (!doc.textExtracted && fs.existsSync(doc.filePath)) {
      const { text, ocrApplied } = await parseDocument(doc.filePath, doc.mimeType);
      doc.textExtracted = text;
      doc.ocrApplied = ocrApplied;
    }

    const aiResults = await analyzeDocumentWithGemini(doc.textExtracted, doc.fileCategory);

    doc.summary = aiResults.summary || doc.summary;
    doc.keywords = aiResults.keywords || doc.keywords;
    doc.classification = aiResults.classification || doc.classification;
    doc.extractedEntities = aiResults.extractedEntities || doc.extractedEntities;
    doc.riskFlags = aiResults.riskFlags || doc.riskFlags;
    doc.status = 'completed';

    await doc.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'DOCUMENT_REANALYZE',
      details: `Re-analyzed document '${doc.originalName}'`,
      ipAddress: req.ip,
      meta: { documentId: doc._id }
    });

    return sendSuccess(res, 'Document re-analyzed successfully', { document: doc });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }

    // Delete local physical file if exists
    if (fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (err) {
        console.warn(`[File Unlink Warning]: ${err.message}`);
      }
    }

    await doc.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'DOCUMENT_DELETE',
      details: `Deleted document '${doc.originalName}'`,
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download extracted document data as JSON or TXT report
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
const downloadDocumentReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });

    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }

    if (format === 'txt') {
      const content = `==================================================
INTELLIGENT DOCUMENT PROCESSING REPORT
==================================================
Original Filename: ${doc.originalName}
File Category: ${doc.fileCategory}
Upload Date: ${doc.createdAt}
OCR Applied: ${doc.ocrApplied ? 'Yes' : 'No'}
Status: ${doc.status}

--------------------------------------------------
DOCUMENT SUMMARY
--------------------------------------------------
${doc.summary}

--------------------------------------------------
KEYWORDS
--------------------------------------------------
${doc.keywords.join(', ')}

--------------------------------------------------
EXTRACTED ENTITIES
--------------------------------------------------
Names: ${doc.extractedEntities.names.join(', ') || 'None'}
Emails: ${doc.extractedEntities.emails.join(', ') || 'None'}
Phones: ${doc.extractedEntities.phoneNumbers.join(', ') || 'None'}
Addresses: ${doc.extractedEntities.addresses.join(', ') || 'None'}
Dates: ${doc.extractedEntities.dates.join(', ') || 'None'}
Invoice #: ${doc.extractedEntities.invoiceNumbers.join(', ') || 'None'}
GST: ${doc.extractedEntities.gstNumbers.join(', ') || 'None'}
PAN: ${doc.extractedEntities.panNumbers.join(', ') || 'None'}
Amounts: ${doc.extractedEntities.amounts.join(', ') || 'None'}

--------------------------------------------------
RISK & COMPLIANCE FLAGS
--------------------------------------------------
${doc.riskFlags.map(r => `[${r.severity}] ${r.issue}: ${r.description}`).join('\n') || 'No risk flags detected.'}

--------------------------------------------------
RAW EXTRACTED TEXT
--------------------------------------------------
${doc.textExtracted}
`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}-report.txt"`);
      return res.send(content);
    }

    // Default JSON export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}-analysis.json"`);
    return res.json(doc);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  reanalyzeDocument,
  deleteDocument,
  downloadDocumentReport
};
