const User = require('../models/User');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { getIsConnected } = require('../config/db');
const { memoryDb } = require('../utils/memoryStore');
const { sendSuccess, sendError } = require('../utils/response');

const getSystemStats = async (req, res, next) => {
  try {
    let totalUsers = memoryDb.users.length;
    let totalDocuments = memoryDb.documents.length;
    let totalLogs = memoryDb.activityLogs.length;
    let ocrCount = memoryDb.documents.filter(d => d.ocrApplied).length;

    if (getIsConnected()) {
      try {
        totalUsers = await User.countDocuments();
        totalDocuments = await Document.countDocuments();
        totalLogs = await ActivityLog.countDocuments();
        ocrCount = await Document.countDocuments({ ocrApplied: true });
      } catch (e) {}
    }

    return sendSuccess(res, 'System stats retrieved', {
      totalUsers,
      totalDocuments,
      totalLogs,
      ocrCount,
      serverUptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    let users = memoryDb.users;
    if (getIsConnected()) {
      try {
        users = await User.find().select('-password').sort({ createdAt: -1 });
      } catch (e) {}
    }
    return sendSuccess(res, 'Users list retrieved', { users });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = String(req.params.id);

    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role value', 400);
    }

    let user;
    if (getIsConnected()) {
      try {
        user = await User.findById(userId);
        if (user) {
          user.role = role;
          await user.save();
        }
      } catch (e) {}
    }

    if (!user) {
      user = memoryDb.users.find(u => String(u._id) === userId);
      if (user) user.role = role;
    }

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, `User role updated to ${role}`, { user });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    let logs = memoryDb.activityLogs;
    if (getIsConnected()) {
      try {
        logs = await ActivityLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
      } catch (e) {}
    }
    return sendSuccess(res, 'Audit logs retrieved', { logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  getAuditLogs
};
