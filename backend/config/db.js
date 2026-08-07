const mongoose = require('mongoose');

let isConnected = false;

// Disable Mongoose query buffering so disconnections fail fast or trigger mock storage fallback immediately
mongoose.set('bufferCommands', false);

const seedDefaultUsers = async () => {
  try {
    const User = require('../models/User');
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin'
      });
      console.log('[MongoDB Seed]: Default admin@example.com created');
    }

    const demoExists = await User.findOne({ email: 'demo@example.com' });
    if (!demoExists) {
      await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'Demo123!',
        role: 'user'
      });
      console.log('[MongoDB Seed]: Default demo@example.com created');
    }
  } catch (err) {
    console.warn('[MongoDB Seed Notice]:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/idp_platform', {
      serverSelectionTimeoutMS: 2000 // Fast fail-over to in-memory store if local Mongo server isn't running
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    await seedDefaultUsers();
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Notice]: Local MongoDB server not running (${error.message}). Auto-switching backend to In-Memory Database Mode for seamless execution.`);
  }
};

const getIsConnected = () => isConnected;

module.exports = {
  connectDB,
  getIsConnected
};
