const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const { getIsConnected } = require('../config/db');
const { memoryDb, generateId } = require('../utils/memoryStore');
const { answerDocumentQuestion } = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/response');

const askQuestion = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { documentId } = req.params;
    const { question } = req.body;

    let doc;
    if (getIsConnected()) {
      try {
        doc = await Document.findOne({ _id: documentId, user: userId });
      } catch (e) {}
    }
    if (!doc) {
      doc = memoryDb.documents.find(d => String(d._id) === String(documentId) && String(d.user) === userId);
    }

    if (!doc) {
      return sendError(res, 'Document not found or access denied', 404);
    }

    let chat;
    if (getIsConnected()) {
      try {
        chat = await ChatHistory.findOne({ document: documentId, user: userId });
        if (!chat) {
          chat = await ChatHistory.create({ document: documentId, user: userId, messages: [] });
        }
      } catch (e) {}
    }

    if (!chat) {
      chat = memoryDb.chatHistories.find(c => String(c.document) === String(documentId) && String(c.user) === userId);
      if (!chat) {
        chat = { _id: generateId('chat'), document: documentId, user: userId, messages: [] };
        memoryDb.chatHistories.push(chat);
      }
    }

    chat.messages.push({ role: 'user', content: question, timestamp: new Date() });

    const answer = await answerDocumentQuestion(doc.textExtracted || '', question, chat.messages);

    chat.messages.push({ role: 'assistant', content: answer, timestamp: new Date() });

    if (chat.save) await chat.save();

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

const getChatHistory = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { documentId } = req.params;

    let chat;
    if (getIsConnected()) {
      try {
        chat = await ChatHistory.findOne({ document: documentId, user: userId });
      } catch (e) {}
    }
    if (!chat) {
      chat = memoryDb.chatHistories.find(c => String(c.document) === String(documentId) && String(c.user) === userId);
    }

    return sendSuccess(res, 'Chat history retrieved', {
      messages: chat ? chat.messages : []
    });
  } catch (error) {
    next(error);
  }
};

const clearChatHistory = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { documentId } = req.params;

    if (getIsConnected()) {
      try {
        const chat = await ChatHistory.findOne({ document: documentId, user: userId });
        if (chat) {
          chat.messages = [];
          await chat.save();
        }
      } catch (e) {}
    }

    const chat = memoryDb.chatHistories.find(c => String(c.document) === String(documentId) && String(c.user) === userId);
    if (chat) {
      chat.messages = [];
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
