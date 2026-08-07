const app = require('../backend/app');
const { connectDB } = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Vercel Serverless]: Database initialization warning:', err.message);
  }
  return app(req, res);
};

