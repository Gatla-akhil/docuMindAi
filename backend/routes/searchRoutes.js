const express = require('express');
const router = express.Router();
const { searchDocuments } = require('../controllers/searchController');
const { protect } = require('../middlewares/authMiddleware');
const { searchSchema, validate } = require('../validators/schemas');

router.use(protect);

router.get('/', validate(searchSchema), searchDocuments);

module.exports = router;
