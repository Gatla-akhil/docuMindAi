const express = require('express');
const router = express.Router();
const {
  askQuestion,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const { chatQuestionSchema, validate } = require('../validators/schemas');

router.use(protect);

router.post('/:documentId', validate(chatQuestionSchema), askQuestion);
router.get('/:documentId', getChatHistory);
router.delete('/:documentId', clearChatHistory);

module.exports = router;
