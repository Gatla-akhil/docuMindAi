const mongoose = require('mongoose');

let isConnected = false;

// Disable Mongoose query buffering so disconnections fail fast or trigger mock storage fallback immediately
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/idp_platform', {
      serverSelectionTimeoutMS: 2000 // Fast fail-over to in-memory store if local Mongo server isn't running
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
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
