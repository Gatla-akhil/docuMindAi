const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });

const logInfo = (message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const entry = `[INFO] [${timestamp}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}\n`;
  console.log(entry.trim());
  logStream.write(entry);
};

const logError = (message, error = {}) => {
  const timestamp = new Date().toISOString();
  const entry = `[ERROR] [${timestamp}] ${message} - ${error.stack || error.message || error}\n`;
  console.error(entry.trim());
  logStream.write(entry);
};

module.exports = {
  logInfo,
  logError
};
