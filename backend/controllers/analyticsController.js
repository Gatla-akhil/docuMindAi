const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { getIsConnected } = require('../config/db');
const { memoryDb } = require('../utils/memoryStore');
const { sendSuccess } = require('../utils/response');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id);
    let documents = [];
    let recentActivity = [];

    if (getIsConnected()) {
      try {
        documents = await Document.find({ user: userId });
        recentActivity = await ActivityLog.find({ user: userId }).sort({ createdAt: -1 }).limit(8);
      } catch (e) {
        documents = memoryDb.documents.filter(d => String(d.user) === userId);
        recentActivity = memoryDb.activityLogs.filter(a => String(a.user) === userId);
      }
    } else {
      documents = memoryDb.documents.filter(d => String(d.user) === userId);
      recentActivity = memoryDb.activityLogs.filter(a => String(a.user) === userId);
    }

    const totalCount = documents.length;
    const totalStorageBytes = documents.reduce((acc, d) => acc + (d.size || 0), 0);
    const ocrCount = documents.filter(d => d.ocrApplied).length;
    const completedCount = documents.filter(d => d.status === 'completed').length;

    // Category breakdown
    const categoryCounts = {};
    documents.forEach(doc => {
      const cat = doc.fileCategory || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categoryChartData = Object.keys(categoryCounts).map(key => ({
      name: key,
      count: categoryCounts[key]
    }));

    // Daily upload trend (7 days)
    const uploadTrend = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      const dayStr = day.toISOString().split('T')[0];

      const count = documents.filter(d => {
        const dStr = new Date(d.createdAt).toISOString().split('T')[0];
        return dStr === dayStr;
      }).length;

      uploadTrend.push({
        date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uploads: count
      });
    }

    return sendSuccess(res, 'Dashboard metrics retrieved', {
      cards: {
        totalDocuments: totalCount,
        totalStorageMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
        ocrProcessed: ocrCount,
        completedRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100
      },
      charts: {
        categoryDistribution: categoryChartData,
        documentTypes: [
          { type: 'PDF', value: documents.filter(d => d.mimeType?.includes('pdf')).length },
          { type: 'DOCX', value: documents.filter(d => d.mimeType?.includes('word')).length },
          { type: 'Images', value: documents.filter(d => d.mimeType?.startsWith('image/')).length }
        ],
        dailyUploadTrend: uploadTrend
      },
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics
};
