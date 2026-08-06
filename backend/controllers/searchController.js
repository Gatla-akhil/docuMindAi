const Document = require('../models/Document');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Global multi-criteria document search
 * @route   GET /api/search
 * @access  Private
 */
const searchDocuments = async (req, res, next) => {
  try {
    const { q, category, mimeType, startDate, endDate } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { originalName: regex },
        { summary: regex },
        { keywords: regex },
        { textExtracted: regex },
        { 'extractedEntities.names': regex },
        { 'extractedEntities.emails': regex },
        { 'extractedEntities.phoneNumbers': regex },
        { 'extractedEntities.invoiceNumbers': regex },
        { 'extractedEntities.panNumbers': regex },
        { 'extractedEntities.gstNumbers': regex }
      ];
    }

    if (category) {
      filter.fileCategory = category;
    }

    if (mimeType) {
      filter.mimeType = new RegExp(mimeType, 'i');
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(filter);

    return sendSuccess(res, 'Search results retrieved', {
      query: { q, category, mimeType, startDate, endDate },
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

module.exports = {
  searchDocuments
};
