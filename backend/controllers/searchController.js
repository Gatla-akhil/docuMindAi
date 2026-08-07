const Document = require('../models/Document');
const { getIsConnected } = require('../config/db');
const { memoryDb } = require('../utils/memoryStore');
const { sendSuccess } = require('../utils/response');

const searchDocuments = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { q, category, mimeType, startDate, endDate } = req.query;

    let documents = [];

    if (getIsConnected()) {
      try {
        const filter = { user: userId };
        if (q) {
          const regex = new RegExp(q, 'i');
          filter.$or = [
            { originalName: regex },
            { summary: regex },
            { textExtracted: regex },
            { keywords: regex }
          ];
        }
        if (category) filter.fileCategory = category;

        documents = await Document.find(filter).sort({ createdAt: -1 });
      } catch (e) {
        documents = memoryDb.documents.filter(d => String(d.user) === userId);
      }
    } else {
      documents = memoryDb.documents.filter(d => String(d.user) === userId);
    }

    // Filter in-memory if needed
    if (q) {
      const lower = q.toLowerCase();
      documents = documents.filter(d =>
        d.originalName?.toLowerCase().includes(lower) ||
        d.summary?.toLowerCase().includes(lower) ||
        d.textExtracted?.toLowerCase().includes(lower) ||
        JSON.stringify(d.extractedEntities || {}).toLowerCase().includes(lower)
      );
    }

    if (category) {
      documents = documents.filter(d => d.fileCategory === category);
    }

    return sendSuccess(res, 'Search results retrieved', {
      query: { q, category, mimeType, startDate, endDate },
      documents,
      pagination: { page: 1, limit: 100, total: documents.length, pages: 1 }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchDocuments
};
