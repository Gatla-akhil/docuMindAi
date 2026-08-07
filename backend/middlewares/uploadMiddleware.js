const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadDir = isVercel ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '../uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn(`[Upload Middleware Notice]: Fallback to system tmpdir (${err.message})`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.tiff', '.txt',
    // Video Meeting Formats
    '.mp4', '.webm', '.avi', '.mov', '.mkv',
    // Audio & Phone Call Recording Formats
    '.mp3', '.wav', '.m4a', '.ogg', '.aac', '.amr', '.3gp', '.flac'
  ];

  const dangerousExtensions = [
    '.exe', '.php', '.sh', '.bat', '.cmd', '.ps1', '.vbs', '.js', '.jar', '.py',
    '.pl', '.html', '.htm', '.xhtml', '.asp', '.aspx', '.jsp', '.cgi', '.dll'
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (dangerousExtensions.includes(ext)) {
    return cb(new Error(`Security Restriction: Executable file types (${ext}) are prohibited.`), false);
  }

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${file.originalname}). Supported formats: PDF, DOCX, PNG, JPG, MP4, MP3, M4A, AMR, 3GP, WAV, AAC`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB Max
  },
  fileFilter
});

module.exports = upload;
