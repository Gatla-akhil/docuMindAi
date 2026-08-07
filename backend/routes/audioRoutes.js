const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { transcribeAudio } = require('../controllers/audioController');

// Support both single('audio') and single('file')
router.post('/transcribe', upload.single('audio'), transcribeAudio);
router.post('/transcribe-file', upload.single('file'), transcribeAudio);

module.exports = router;
