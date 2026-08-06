const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const { answerDocumentQuestion } = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Ask a question about an uploaded document
 * @route   POST /api/chat/:documentId
 * @access  Private
 */
const askQuestion = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { question } = req.body;

    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return sendError(res, 'Document not found or access denied', 404);
    }

    let chat = await ChatHistory.findOne({ document: documentId, user: req.user._id });
    if (!chat) {
      chat = await ChatHistory.create({
        document: documentId,
        user: req.user._id,
        messages: []
      });
    }

    // Add user question to chat history
    chat.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date()
    });

    // Get AI answer from Gemini
    const answer = await answerDocumentQuestion(doc.textExtracted, question, chat.messages);

    // Add AI answer to chat history
    chat.messages.push({
      role: 'assistant',
      content: answer,
      timestamp: new Date()
    });

    await chat.save();

    return sendSuccess(res, 'Answer generated successfully', {
      question,
      answer,
      chatId: chat._id,
      messages: chat.messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat history for a document
 * @route   GET /api/chat/:documentId
 * @access  Private
 */
const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const chat = await ChatHistory.findOne({ document: documentId, user: req.user._id });

    return sendSuccess(res, 'Chat history retrieved', {
      messages: chat ? chat.messages : []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear chat history for a document
 * @route   DELETE /api/chat/:documentId
 * @access  Private
 */
const clearChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const chat = await ChatHistory.findOne({ document: documentId, user: req.user._id });

    if (chat) {
      chat.messages = [];
      await chat.save();
    }

    return sendSuccess(res, 'Chat history cleared');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askQuestion,
  getChatHistory,
  clearChatHistory
};
