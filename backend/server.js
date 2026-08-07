require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database & Supabase (Auto-fallbacks to in-memory mode if offline)
connectDB();

// Global Uncaught Exception Protection (Prevents server crash on Tesseract/Worker errors)
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception Safe Shield]: ${err.stack || err.message || err}`);
});

process.on('unhandledRejection', (reason) => {
  console.error(`[Unhandled Rejection Safe Shield]: ${reason?.stack || reason?.message || reason}`);
});

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 IDP AI Platform Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`==================================================`);
});
