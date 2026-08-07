const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { getIsConnected } = require('../config/db');
const { supabase, getIsSupabaseConnected } = require('../config/supabase');
const { memoryDb, generateId } = require('../utils/memoryStore');
const { sendSuccess, sendError } = require('../utils/response');

const generateAccessToken = (user) => {
  const userId = String(user._id || user.id);
  return jwt.sign(
    { id: userId, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_access_key_change_in_production_2026',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

const generateRefreshToken = (user) => {
  const userId = String(user._id || user.id);
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_change_in_production_2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

const normalizeUser = (u) => {
  if (!u) return null;
  const user = u.toObject ? u.toObject() : { ...u };
  const userId = String(user._id || user.id);
  delete user.password;
  user._id = userId;
  user.id = userId;
  return user;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    let existingUser = null;

    if (getIsConnected()) {
      try { existingUser = await User.findOne({ email: cleanEmail }); } catch (e) {}
    }
    if (!existingUser && getIsSupabaseConnected()) {
      try {
        const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).single();
        if (data) existingUser = data;
      } catch (e) {}
    }
    if (!existingUser) {
      existingUser = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (existingUser) {
      return sendError(res, 'User with this email already exists. Please log in instead.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let createdMongoUser = null;
    if (getIsConnected()) {
      try {
        createdMongoUser = await User.create({
          name: cleanName,
          email: cleanEmail,
          password: password, // Raw password so pre('save') hook single-hashes it
          role: 'user'
        });
      } catch (dbErr) {
        console.warn(`[DB Register Notice]: ${dbErr.message}`);
      }
    }

    const userId = createdMongoUser ? String(createdMongoUser._id) : generateId('usr');

    const memUserObj = {
      _id: userId,
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingIndex = memoryDb.users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      memoryDb.users[existingIndex] = memUserObj;
    } else {
      memoryDb.users.push(memUserObj);
    }

    if (getIsSupabaseConnected()) {
      try {
        await supabase.from('users').insert({
          id: userId,
          name: cleanName,
          email: cleanEmail,
          role: 'user',
          created_at: new Date()
        });
      } catch (spErr) {
        console.warn(`[Supabase Insert Warning]: ${spErr.message}`);
      }
    }

    const finalUser = createdMongoUser ? normalizeUser(createdMongoUser) : normalizeUser(memUserObj);
    const accessToken = generateAccessToken(finalUser);
    const refreshTokenToken = generateRefreshToken(finalUser);

    return res.status(201).json({
      success: true,
      message: 'Registration Successful',
      token: accessToken,
      accessToken,
      refreshToken: refreshTokenToken,
      user: finalUser,
      data: {
        user: finalUser,
        token: accessToken,
        accessToken,
        refreshToken: refreshTokenToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Please provide both email and password', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    if (getIsConnected()) {
      try {
        const dbUser = await User.findOne({ email: cleanEmail }).select('+password');
        if (dbUser) {
          let isMatch = false;
          try {
            isMatch = await dbUser.matchPassword(password);
          } catch (e) {}

          // Robust fallbacks for single-hash, double-hash, or plain text matches
          if (!isMatch && dbUser.password) {
            try {
              isMatch = await bcrypt.compare(password, dbUser.password);
            } catch (e) {}

            if (!isMatch) {
              isMatch = (dbUser.password === password);
            }

            if (isMatch) {
              try {
                dbUser.password = password; // Mongoose pre('save') hook single-hashes it cleanly
                await dbUser.save();
              } catch (e) {}
            }
          }

          if (isMatch) {
            user = dbUser;
          }
        }
      } catch (err) {
        console.error('[Mongo Login Error]:', err.message);
      }
    }

    if (!user) {
      const memUser = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (memUser) {
        let isMatch = false;
        if (memUser.password && (memUser.password.startsWith('$2a$') || memUser.password.startsWith('$2b$') || memUser.password.startsWith('$2y$'))) {
          isMatch = await bcrypt.compare(password, memUser.password);
        } else {
          isMatch = (memUser.password === password);
        }
        if (isMatch) {
          user = memUser;
          if (getIsConnected()) {
            try {
              const existingMongo = await User.findOne({ email: cleanEmail });
              if (!existingMongo) {
                await User.create({
                  _id: memUser._id || memUser.id,
                  name: memUser.name,
                  email: cleanEmail,
                  password: password,
                  role: memUser.role || 'user'
                });
              }
            } catch (e) {}
          }
        }
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Login failed. Wrong password or user not found. Please register first or check your credentials.'
      });
    }

    const sanitized = normalizeUser(user);
    const accessToken = generateAccessToken(sanitized);
    const refreshTokenToken = generateRefreshToken(sanitized);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      accessToken,
      refreshToken: refreshTokenToken,
      user: sanitized,
      data: {
        user: sanitized,
        token: accessToken,
        accessToken,
        refreshToken: refreshTokenToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return sendError(res, 'Refresh token required', 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_change_in_production_2026'
      );
    } catch (err) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    let user = null;
    if (getIsConnected()) {
      try {
        user = await User.findById(decoded.id);
      } catch (err) {}
    }
    if (!user) {
      user = memoryDb.users.find(u => String(u._id) === String(decoded.id) || String(u.id) === String(decoded.id));
    }

    if (!user) {
      return sendError(res, 'User no longer exists', 401);
    }

    const sanitized = normalizeUser(user);
    const newAccessToken = generateAccessToken(sanitized);

    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  return sendSuccess(res, 'Logged out successfully');
};

const getProfile = async (req, res) => {
  return sendSuccess(res, 'Profile retrieved successfully', { user: normalizeUser(req.user) });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = String(req.user._id || req.user.id);

    let updatedUser = null;
    if (getIsConnected()) {
      try {
        const dbUser = await User.findByIdAndUpdate(
          userId,
          { name, email: email ? email.toLowerCase() : undefined },
          { new: true, runValidators: true }
        );
        if (dbUser) updatedUser = normalizeUser(dbUser);
      } catch (err) {}
    }

    const memIndex = memoryDb.users.findIndex(u => String(u._id) === userId || String(u.id) === userId);
    if (memIndex !== -1) {
      if (name) memoryDb.users[memIndex].name = name;
      if (email) memoryDb.users[memIndex].email = email.toLowerCase();
      updatedUser = normalizeUser(memoryDb.users[memIndex]);
    }

    // Update Supabase row if enabled
    if (getIsSupabaseConnected()) {
      try {
        await supabase.from('users').update({
          name: name || undefined,
          email: email ? email.toLowerCase() : undefined
        }).eq('id', userId);
      } catch (e) {}
    }

    return sendSuccess(res, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};
