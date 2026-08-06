const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Get dashboard metrics, charts & recent activity
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Total counts & storage
    const documents = await Document.find({ user: userId });
    const totalCount = documents.length;
    const totalStorageBytes = documents.reduce((acc, d) => acc + (d.size || 0), 0);
    const ocrCount = documents.filter(d => d.ocrApplied).length;
    const completedCount = documents.filter(d => d.status === 'completed').length;

    // 2. Breakdown by Category
    const categoryCounts = {};
    documents.forEach(doc => {
      const cat = doc.fileCategory || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categoryChartData = Object.keys(categoryCounts).map(key => ({
      name: key,
      count: categoryCounts[key]
    }));

    // 3. Breakdown by MIME type
    const mimeCounts = {
      PDF: documents.filter(d => d.mimeType === 'application/pdf').length,
      DOCX: documents.filter(d => d.mimeType.includes('word')).length,
      Images: documents.filter(d => d.mimeType.startsWith('image/')).length,
      Other: documents.filter(d => !d.mimeType.includes('pdf') && !d.mimeType.includes('word') && !d.mimeType.startsWith('image/')).length
    };
    const documentTypeChartData = Object.keys(mimeCounts).map(key => ({
      type: key,
      value: mimeCounts[key]
    }));

    // 4. Daily Upload Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

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

    // 5. Recent Activity Logs
    const recentActivity = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(8);

    return sendSuccess(res, 'Dashboard metrics retrieved', {
      cards: {
        totalDocuments: totalCount,
        totalStorageMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
        ocrProcessed: ocrCount,
        completedRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100
      },
      charts: {
        categoryDistribution: categoryChartData,
        documentTypes: documentTypeChartData,
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
