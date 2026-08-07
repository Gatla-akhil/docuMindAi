const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const { getIsConnected } = require('../config/db');
const { memoryDb, generateId } = require('../utils/memoryStore');
const { answerDocumentQuestion } = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/response');

const askQuestion = async (req, res, next) => {
  try {
    const userId = req.user ? String(req.user._id || req.user.id) : 'usr_demo_002';
    const documentId = req.params.documentId || req.body.documentId || req.body.docId;
    const { question } = req.body;

    if (!question) {
      return sendError(res, 'Question is required', 400);
    }

    let doc = null;
    if (documentId) {
      if (getIsConnected()) {
        try {
          doc = await Document.findOne({ _id: documentId });
          if (!doc) doc = await Document.findById(documentId);
        } catch (e) {}
      }
      if (!doc) {
        doc = memoryDb.documents.find(d => String(d._id) === String(documentId) || String(d.id) === String(documentId));
      }
    }

    // Fallback: If no documentId specified, use the most recent document as context
    if (!doc && memoryDb.documents.length > 0) {
      doc = memoryDb.documents[memoryDb.documents.length - 1];
    }

    const targetDocId = doc ? String(doc._id || doc.id) : (documentId || 'doc_demo_101');
    const docText = doc ? (doc.textExtracted || doc.summary || '') : 'Document analysis context.';

    let chat;
    if (getIsConnected()) {
      try {
        chat = await ChatHistory.findOne({ document: targetDocId, user: userId });
        if (!chat) {
          chat = await ChatHistory.create({ document: targetDocId, user: userId, messages: [] });
        }
      } catch (e) {}
    }

    if (!chat) {
      chat = memoryDb.chatHistories.find(c => String(c.document) === String(targetDocId));
      if (!chat) {
        chat = { _id: generateId('chat'), document: targetDocId, user: userId, messages: [] };
        memoryDb.chatHistories.push(chat);
      }
    }

    chat.messages.push({ role: 'user', content: question, timestamp: new Date() });

    const answer = await answerDocumentQuestion(docText, question, chat.messages);

    chat.messages.push({ role: 'assistant', content: answer, timestamp: new Date() });

    if (chat.save) await chat.save().catch(() => {});

    return res.status(200).json({
      success: true,
      answer: answer,
      response: answer,
      message: 'Answer generated successfully',
      data: {
        question,
        answer,
        chatId: chat._id,
        messages: chat.messages
      }
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
