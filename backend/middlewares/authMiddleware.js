const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { memoryDb } = require('../utils/memoryStore');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ') &&
    req.headers.authorization.split(' ')[1] &&
    req.headers.authorization.split(' ')[1] !== 'null' &&
    req.headers.authorization.split(' ')[1] !== 'undefined'
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token && req.query.token !== 'null' && req.query.token !== 'undefined') {
    // Support JWT token via query parameter for direct file downloads
    token = req.query.token;
  }

  if (!token) {
    return sendError(res, 'Not authorized to access this route. Token missing.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_access_key_change_in_production_2026');

    if (getIsConnected()) {
      try {
        req.user = await User.findById(decoded.id);
      } catch (err) {
        req.user = memoryDb.users.find(u => String(u._id) === String(decoded.id) || String(u.id) === String(decoded.id));
      }
    } else {
      req.user = memoryDb.users.find(u => String(u._id) === String(decoded.id) || String(u.id) === String(decoded.id));
    }

    if (!req.user) {
      return sendError(res, 'User associated with token no longer exists.', 401);
    }

    next();
  } catch (error) {
    return sendError(res, 'Token verification failed or token expired.', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
