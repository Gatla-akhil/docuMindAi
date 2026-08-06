const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  reanalyzeDocument,
  deleteDocument,
  downloadDocumentReport
} = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/:id/reanalyze', reanalyzeDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocumentReport);

module.exports = router;
