const express = require('express');
const router = express.Router();
const { uploadDocument } = require('../controllers/documentController');
const upload = require('../middlewares/uploadMiddleware');

// Direct upload router (/upload)
router.post('/', upload.single('file'), uploadDocument);

module.exports = router;
