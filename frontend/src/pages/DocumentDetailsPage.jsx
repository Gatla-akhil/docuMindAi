import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { downloadDocumentFile } from '../services/api';
import toast from 'react-hot-toast';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import EntityCard from '../components/EntityCard';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  FileText,
  Scan,
  Download,
  Trash2,
  RefreshCw,
  MessageSquare,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  DollarSign,
  Table as TableIcon,
  Tag,
  ShieldAlert,
  Globe,
  Languages,
  Video,
  List,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Sparkles,
  Camera,
  Heart,
  MessageCircle,
  Bookmark
} from 'lucide-react';

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('conversation');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Translation State
  const [targetLang, setTargetLang] = useState('te');
  const [translating, setTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState(null);

  // Social Media Designer State
  const [socialPlatform, setSocialPlatform] = useState('instagram'); // 'instagram' | 'facebook' | 'snapchat'
  const [cardTheme, setCardTheme] = useState('purple'); // 'purple' | 'sunset' | 'neon' | 'dark' | 'rose'
  const [emojiTheme, setEmojiTheme] = useState('excited'); // 'excited' | 'insight' | 'speech' | 'inspired'
  const socialCardRef = useRef(null);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      setDocument(res.data.data.document);
    } catch (err) {
      toast.error('Failed to load document details.');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const handleTranslate = async (langCode) => {
    setTranslating(true);
    setTargetLang(langCode);
    try {
      const res = await api.post(`/documents/${id}/translate`, { targetLanguage: langCode });
      setTranslatedData(res.data.data);
      toast.success(`Translated conversation into selected language!`);
    } catch (err) {
      toast.error('Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await api.post(`/documents/${id}/reanalyze`);
      setDocument(res.data.data.document);
      toast.success('Document re-analyzed with AI successfully!');
    } catch (err) {
      toast.error('Re-analysis failed.');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted successfully.');
      navigate('/history');
    } catch (err) {
      toast.error('Failed to delete document.');
    }
  };

  const copyConversationText = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copied pure conversation text to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <DetailSkeleton />;
  if (!document) return null;

  const docId = document._id || document.id;
  const entities = document.extractedEntities || {};
  const isVideoOrAudio = ['Video', 'Meeting Video', 'Audio', 'Phone Call'].includes(document.fileCategory) || 
    ['.mp4', '.webm', '.avi', '.mov', '.mp3', '.wav', '.m4a', '.amr'].some(ext => document.originalName.toLowerCase().endsWith(ext));

  // Pure Conversation Text
  const currentConversationText = translatedData
    ? translatedData.translatedText
    : (document.textExtracted || document.summary || 'No conversation text extracted.');

  const bulletLines = currentConversationText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 5 && !l.startsWith('===') && !l.startsWith('---'));

  // Emoji Symbol Sets
  const emojiSets = {
    excited: ['🔥', '✨', '🚀', '🤩', '🎉'],
    business: ['💼', '🚀', '📈', '💡', '👔'],
    insight: ['💡', '🎯', '⚡', '🧠', '📊'],
    speech: ['💬', '🗣️', '🎙️', '📝', '💭'],
    inspired: ['🌟', '❤️', '💪', '🥳', '🙌']
  };
  const activeEmojis = emojiSets[emojiTheme] || emojiSets.excited;

  // Social Theme Gradients
  const themeGradients = {
    purple: 'from-purple-600 via-indigo-600 to-blue-600',
    sunset: 'from-amber-500 via-rose-600 to-purple-700',
    neon: 'from-emerald-500 via-teal-600 to-cyan-600',
    dark: 'from-slate-900 via-purple-950 to-slate-900',
    rose: 'from-pink-500 via-rose-500 to-purple-600'
  };

  // Caption Generator for Social Posts (Instagram, LinkedIn, Facebook, Snapchat)
  const socialCaption = socialPlatform === 'linkedin'
    ? `👔 Key Professional Insights: ${document.originalName} 💼\n\n${bulletLines.slice(0, 3).map(l => `▪️ ${l}`).join('\n')}\n\n💡 Translated into ${targetLang.toUpperCase()} | Intelligent Document & Conversation AI 📈\n\n#Leadership #ProfessionalDevelopment #AI #Innovation #BusinessStrategy #${targetLang.toUpperCase()}`
    : `✨ ${activeEmojis[0]} ${document.originalName} Highlight ${activeEmojis[1]}\n\n${bulletLines.slice(0, 3).map(l => `• ${l}`).join('\n')}\n\n${activeEmojis[2]} Shared in ${targetLang.toUpperCase()} | Intelligent Conversation AI ${activeEmojis[3]}\n\n#ConversationAI #MeetingHighlights #Story #Trending #${targetLang.toUpperCase()} #ViralContent ${activeEmojis[4]}`;

  const copySocialCaption = () => {
    navigator.clipboard.writeText(socialCaption);
    toast.success(`Copied ${socialPlatform.toUpperCase()} caption & hashtags to clipboard!`);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl ${isVideoOrAudio ? 'bg-purple-500/10 text-purple-500' : 'bg-indigo-500/10 text-indigo-500'} flex items-center justify-center`}>
              {isVideoOrAudio ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{document.originalName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                  {document.fileCategory}
                </span>
                {document.ocrApplied && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                    <Scan className="w-3 h-3" /> Transcribed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Uploaded on {new Date(document.createdAt).toLocaleString()} • {document.size < 1024 * 1024 ? `${(document.size / 1024).toFixed(1)} KB` : `${(document.size / (1024 * 1024)).toFixed(1)} MB`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={() => setActiveTab('social')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-md hover:opacity-95 transition-opacity flex items-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>📲 Social Post Designer</span>
            </button>

            <Link
              to={`/chat?doc=${docId}`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg shadow-md hover:opacity-95 transition-opacity flex items-center space-x-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </Link>

            <button
              onClick={() => copyConversationText(currentConversationText)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Text!' : 'Copy Conversation'}</span>
            </button>

            <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white/50 dark:bg-slate-900/50">
              <button
                onClick={() => downloadDocumentFile(docId, 'pdf', `${document.originalName || 'document'}-report.pdf`)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-colors flex items-center space-x-1"
                title="Download PDF Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => downloadDocumentFile(docId, 'json', `${document.originalName || 'document'}-analysis.json`)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-colors flex items-center space-x-1"
                title="Download JSON Analysis"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => downloadDocumentFile(docId, 'csv', `${document.originalName || 'document'}-data.csv`)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors flex items-center space-x-1"
                title="Download CSV Table"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => downloadDocumentFile(docId, 'txt', `${document.originalName || 'document'}-conversation.txt`)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors flex items-center space-x-1"
                title="Download Pure Text"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TXT</span>
              </button>
            </div>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multilingual Document & Conversation Translator Bar */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200">Select User Defined Language for Social Post & Conversation</span>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Translates video/audio conversation text & social graphics into your chosen language</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={targetLang}
              onChange={(e) => handleTranslate(e.target.value)}
              disabled={translating}
              className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 font-bold text-indigo-900 dark:text-indigo-100 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="te">🇮🇳 తెలుగు (Telugu)</option>
              <option value="hi">🇮🇳 हिंदी (Hindi)</option>
              <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
              <option value="kn">🇮🇳 ಕನ್ನಡ (Kannada)</option>
              <option value="ml">🇮🇳 മലയാളം (Malayalam)</option>
              <option value="mr">🇮🇳 मराठी (Marathi)</option>
              <option value="bn">🇮🇳 বাংলা (Bengali)</option>
              <option value="gu">🇮🇳 ગુજરાતી (Gujarati)</option>
              <option value="pa">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="or">🇮🇳 ଓଡ଼ିଆ (Odia)</option>
              <option value="ur">🇮🇳 اردو (Urdu)</option>
              <option value="as">🇮🇳 অসমীয়া (Assamese)</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español (Spanish)</option>
              <option value="fr">🇫🇷 Français (French)</option>
              <option value="de">🇩🇪 Deutsch (German)</option>
              <option value="zh">🇨🇳 中文 (Chinese)</option>
              <option value="ja">🇯🇵 日本語 (Japanese)</option>
              <option value="ar">🇦🇪 العربية (Arabic)</option>
            </select>
            {translating && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pt-2 overflow-x-auto">
          {[
            { id: 'conversation', label: '💬 Pure Conversation Text' },
            { id: 'social', label: '📲 Instagram / FB / Snapchat Post Designer' },
            { id: 'bullets', label: '• Bullet Points' },
            { id: 'summary', label: 'AI Summary' },
            { id: 'entities', label: 'Extracted Entities' },
            { id: 'tables', label: 'Action Items Table' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Social Media Post Designer (Instagram, Facebook, Snapchat) */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-pink-500" />
                <span>Instagram, Facebook & Snapchat Graphic Post Designer</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Converts your extracted conversation into styled social media post graphics with emojis, speech bubbles, and custom color themes in your specified language.
              </p>
            </div>

            {/* Design Customizers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Target Platform</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-500' },
                    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
                    { id: 'snapchat', label: 'Snapchat', icon: Sparkles, color: 'text-amber-400' }
                  ].map((p) => {
                    const IconComp = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSocialPlatform(p.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all ${
                          socialPlatform === p.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 ${socialPlatform === p.id ? 'text-white' : p.color}`} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Card Gradient Theme</label>
                <div className="flex space-x-2">
                  {[
                    { id: 'purple', label: 'Purple', bg: 'bg-gradient-to-r from-purple-600 to-blue-600' },
                    { id: 'sunset', label: 'Sunset', bg: 'bg-gradient-to-r from-amber-500 to-rose-600' },
                    { id: 'neon', label: 'Neon', bg: 'bg-gradient-to-r from-emerald-500 to-cyan-600' },
                    { id: 'rose', label: 'Rose', bg: 'bg-gradient-to-r from-pink-500 to-purple-600' },
                    { id: 'dark', label: 'Dark', bg: 'bg-gradient-to-r from-slate-900 to-purple-950' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCardTheme(t.id)}
                      className={`w-7 h-7 rounded-full ${t.bg} border-2 transition-all ${
                        cardTheme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                      }`}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>

              {/* Emoji Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Emoji Expression Theme</label>
                <select
                  value={emojiTheme}
                  onChange={(e) => setEmojiTheme(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="excited">🔥 Excitement & Trending (🔥✨🚀🤩🎉)</option>
                  <option value="insight">💡 Smart Insights (💡🎯⚡🧠📊)</option>
                  <option value="speech">💬 Speech Quote (💬🗣️🎙️📝💭)</option>
                  <option value="inspired">🌟 Inspirational (🌟❤️💪🥳🙌)</option>
                </select>
              </div>
            </div>

            {/* Social Post Graphic Card Canvas */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 pt-4">
              <div
                ref={socialCardRef}
                className={`w-full max-w-md p-8 rounded-3xl bg-gradient-to-br ${themeGradients[cardTheme]} text-white shadow-2xl space-y-6 relative overflow-hidden border border-white/20`}
              >
                {/* Background Emojis */}
                <div className="absolute top-2 right-4 text-4xl opacity-20 select-none">{activeEmojis[0]}</div>
                <div className="absolute bottom-4 right-6 text-5xl opacity-20 select-none">{activeEmojis[1]}</div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md font-bold text-xs uppercase tracking-wider">
                      {socialPlatform === 'linkedin' ? '💼 LinkedIn Professional' : socialPlatform === 'instagram' ? '📸 Instagram Story' : socialPlatform === 'facebook' ? '📘 Facebook Feed' : '👻 Snapchat Card'}
                    </span>
                    <span className="text-xs font-semibold opacity-90">{targetLang.toUpperCase()}</span>
                  </div>
                  <span className="text-xl">{activeEmojis[0]} {activeEmojis[1]}</span>
                </div>

                {/* Conversation Card Body */}
                <div className="space-y-4 relative z-10">
                  <h4 className="font-extrabold text-lg leading-tight drop-shadow-md">
                    {document.originalName}
                  </h4>

                  {/* Speech Quote Bubble */}
                  <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold opacity-90">
                      <span>{activeEmojis[2]} Spoken Conversation Highlight</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed drop-shadow-sm line-clamp-4">
                      "{bulletLines[0] || currentConversationText.slice(0, 200)}"
                    </p>
                  </div>

                  {/* Conversation Key Bullets */}
                  <div className="space-y-2">
                    {bulletLines.slice(1, 4).map((line, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs font-medium opacity-95">
                        <span className="text-sm shrink-0">{activeEmojis[idx % activeEmojis.length]}</span>
                        <span className="line-clamp-2">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs opacity-90">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1"><Heart className="w-3.5 h-3.5 fill-current" /> <span>2.4k</span></span>
                    <span className="flex items-center space-x-1"><MessageCircle className="w-3.5 h-3.5" /> <span>184</span></span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">#ConversationAI {activeEmojis[4]}</span>
                </div>
              </div>

              {/* Action Buttons for Caption & Image */}
              <div className="w-full max-w-md space-y-4">
                <div className="p-6 rounded-2xl glass-panel space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Generated Social Caption & Hashtags</span>
                  </h4>

                  <textarea
                    readOnly
                    value={socialCaption}
                    rows={6}
                    className="w-full p-3 text-xs rounded-xl bg-slate-900 text-slate-100 font-mono focus:outline-none border border-slate-800 leading-relaxed"
                  />

                  <div className="flex space-x-2">
                    <button
                      onClick={copySocialCaption}
                      className="flex-1 py-3 rounded-xl font-bold text-xs text-white gradient-bg shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Caption & Hashtags</span>
                    </button>

                    <button
                      onClick={() => toast.success(`Post graphic ready for ${socialPlatform.toUpperCase()}!`)}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4 text-purple-500" />
                      <span>Save Graphic</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: PURE CONVERSATION TEXT VIEW (No Report Headers) */}
      {activeTab === 'conversation' && (
        <div className="space-y-4">
          {translatedData && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Showing Pure Conversation Text in Selected Language ({translatedData.targetLanguage.toUpperCase()})</span>
              </span>
              <button onClick={() => setTranslatedData(null)} className="underline hover:opacity-80">Reset to Original</button>
            </div>
          )}

          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <span>Video / Audio Spoken Conversation Dialogue Text</span>
              </h3>
              <button
                onClick={() => copyConversationText(currentConversationText)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </button>
            </div>

            {/* Pure Raw Conversation Text Container */}
            <div className="p-6 rounded-2xl bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
              {currentConversationText}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bullet Points */}
      {activeTab === 'bullets' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <List className="w-5 h-5 text-indigo-500" />
              <span>Extracted Conversation Bullet Points</span>
            </h3>

            <div className="space-y-3">
              {bulletLines.map((line, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {translatedData && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Showing Translated Summary in Selected Language ({targetLang.toUpperCase()})</span>
              </span>
              <button onClick={() => setTranslatedData(null)} className="underline hover:opacity-80">Reset to Original</button>
            </div>
          )}

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span>Summary Overview ({targetLang.toUpperCase()})</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {translatedData ? translatedData.translatedSummary : (document.summary || 'Summary not generated.')}
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              {document.keywords?.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Entities */}
      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EntityCard icon={User} title="Names & Speakers Extracted" items={entities.names} color="indigo" />
          <EntityCard icon={Mail} title="Email Addresses" items={entities.emails} color="emerald" />
          <EntityCard icon={Phone} title="Phone Numbers" items={entities.phoneNumbers} color="purple" />
          <EntityCard icon={MapPin} title="Physical Addresses" items={entities.addresses} color="blue" />
          <EntityCard icon={Calendar} title="Important Dates" items={entities.dates} color="amber" />
          <EntityCard icon={CreditCard} title="Invoice / Reference Numbers" items={entities.invoiceNumbers} color="pink" />
          <EntityCard icon={Building} title="GSTIN Identifiers" items={entities.gstNumbers} color="emerald" />
          <EntityCard icon={Tag} title="PAN Numbers" items={entities.panNumbers} color="indigo" />
          <EntityCard icon={DollarSign} title="Amounts & Pricing" items={entities.amounts} color="amber" />
        </div>
      )}

      {/* Tab 5: Action Items Table */}
      {activeTab === 'tables' && (
        <div className="p-6 rounded-2xl glass-panel space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <TableIcon className="w-5 h-5 text-indigo-500" />
            <span>Extracted Action Items & Tabular Data</span>
          </h3>

          {entities.tables && entities.tables.length > 0 ? (
            entities.tables.map((table, tIdx) => (
              <div key={tIdx} className="space-y-3">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{table.title}</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        {table.headers?.map((h, hIdx) => (
                          <th key={hIdx} className="p-3 border-b border-slate-200 dark:border-slate-800">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {table.rows?.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs italic text-slate-400">No tables were identified in this document.</p>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Document"
        message={`Are you sure you want to permanently delete '${document.originalName}'? This action cannot be undone.`}
        confirmText="Delete Permanently"
        isDangerous={true}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default DocumentDetailsPage;
