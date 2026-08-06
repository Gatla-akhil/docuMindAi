const express = require('express');
const router = express.Router();
const {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/logs', getAuditLogs);

module.exports = router;
