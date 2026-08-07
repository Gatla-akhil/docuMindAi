const express = require('express');
const router = express.Router();
const { translate, summary, bullets } = require('../controllers/aiController');

router.post('/translate', translate);
router.post('/summary', summary);
router.post('/bullets', bullets);

module.exports = router;
