const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  reanalyzeDocument,
  deleteDocument,
  downloadDocumentReport,
  translateDocument
} = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Protect all document routes below
router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocumentReport);
router.post('/:id/reanalyze', reanalyzeDocument);
router.post('/:id/translate', translateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
