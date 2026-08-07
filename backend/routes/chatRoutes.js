const express = require('express');
const router = express.Router();
const {
  askQuestion,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');

// Support both root POST / (direct question) and POST /:documentId
router.post('/', askQuestion);
router.post('/:documentId', askQuestion);
router.get('/:documentId', getChatHistory);
router.delete('/:documentId', clearChatHistory);

module.exports = router;
