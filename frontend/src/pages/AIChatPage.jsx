import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MessageSquareCode,
  Send,
  Trash2,
  FileText,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Loader2
} from 'lucide-react';

const AIChatPage = () => {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get('doc') || '';

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUserDocuments = async () => {
      try {
        const res = await api.get('/documents?limit=50');
        const docs = res.data.data.documents;
        setDocuments(docs);
        if (docs.length > 0 && !selectedDocId) {
          setSelectedDocId(docs[0]._id);
        }
      } catch (err) {
        console.error('Failed to load documents list:', err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchUserDocuments();
  }, []);

  useEffect(() => {
    if (!selectedDocId) return;

    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/chat/${selectedDocId}`);
        setMessages(res.data.data.messages || []);

        const docRes = await api.get(`/documents/${selectedDocId}`);
        setSelectedDoc(docRes.data.data.document);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchChatHistory();
  }, [selectedDocId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!question.trim() || !selectedDocId || sending) return;

    const qText = question.trim();
    setQuestion('');
    setSending(true);

    // Optimistic UI update
    setMessages(prev => [
      ...prev,
      { role: 'user', content: qText, timestamp: new Date().toISOString() }
    ]);

    try {
      const res = await api.post(`/chat/${selectedDocId}`, { question: qText });
      setMessages(res.data.data.messages);
    } catch (err) {
      toast.error('AI model failed to generate response');
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedDocId) return;
    try {
      await api.delete(`/chat/${selectedDocId}`);
      setMessages([]);
      toast.success('Chat history cleared.');
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  const presetQuestions = [
    'Summarize the core points of this document.',
    'List all names, emails, and contact numbers found.',
    'Are there any invoice amounts or dates mentioned?',
    'Identify any risk factors or compliance issues.'
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar Document Selector */}
      <div className="w-full md:w-80 glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-auto md:h-full">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Select Document Context</span>
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <button
                key={doc._id}
                onClick={() => setSelectedDocId(doc._id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedDocId === doc._id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                }`}
              >
                <p className="font-bold truncate">{doc.originalName}</p>
                <div className="flex justify-between items-center mt-1 text-[10px] opacity-80">
                  <span>{doc.fileCategory}</span>
                  <span>{(doc.size / 1024).toFixed(0)} KB</span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs italic text-slate-400 p-2">No uploaded documents available.</p>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl gradient-bg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedDoc ? selectedDoc.originalName : 'AI Document Assistant'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Powered by Gemini 1.5 Flash • Contextual RAG active
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Transcript */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto py-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                Ask anything about this document!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try one of the preset prompts below or type your custom query.
              </p>

              <div className="grid grid-cols-1 gap-2 w-full pt-2">
                {presetQuestions.map((pq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(pq);
                    }}
                    className="p-2.5 rounded-xl text-xs text-left bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    💡 "{pq}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg gradient-bg text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-bold text-xs">
                    U
                  </div>
                )}
              </div>
            ))
          )}

          {sending && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Gemini is generating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 bg-white/40 dark:bg-slate-900/40">
          <input
            type="text"
            placeholder={selectedDocId ? "Ask a question about this document..." : "Select a document first..."}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!selectedDocId || sending}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!question.trim() || !selectedDocId || sending}
            className="p-2.5 rounded-xl text-white gradient-bg shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatPage;
