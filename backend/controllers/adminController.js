const User = require('../models/User');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get system status stats & total users/docs
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const totalLogs = await ActivityLog.countDocuments();
    const ocrCount = await Document.countDocuments({ ocrApplied: true });

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

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, 'Users list retrieved', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user role (User <-> Admin)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role value', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.role = role;
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_UPDATE_USER_ROLE',
      details: `Changed role of ${user.email} to '${role}'`,
      ipAddress: req.ip
    });

    return sendSuccess(res, `User role updated to ${role}`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all system audit logs
 * @route   GET /api/admin/logs
 * @access  Private (Admin)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

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
