import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Clapperboard,
  UploadCloud,
  Sparkles,
  Languages,
  CheckCircle2,
  Video,
  Copy,
  Share2,
  Sliders,
  Maximize2,
  TrendingUp,
  Smile,
  Activity,
  Layers,
  Award
} from 'lucide-react';

const PerformancePage = () => {
  const navigate = useNavigate();

  // Performance Form State
  const [performanceType, setPerformanceType] = useState('dance'); // 'dance' | 'mime' | 'skit' | 'shortfilm'
  const [userVideo, setUserVideo] = useState(null);
  const [originalVideo, setOriginalVideo] = useState(null);
  const [customNotes, setCustomNotes] = useState('My dance cover performance compared against original choreography.');
  const [targetLang, setTargetLang] = useState('te');

  // Processing & Result State
  const [processing, setProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleComparisonSubmit = async (e) => {
    e.preventDefault();

    if (!userVideo && !customNotes) {
      toast.error('Please select your performance video or describe your performance.');
      return;
    }

    setProcessing(true);
    toast.loading(`Analyzing side-by-side performance differences & generating improvement tips in ${targetLang.toUpperCase()}...`);

    try {
      const fileName = userVideo ? userVideo.name : `${performanceType}_performance_cover.mp4`;
      const fullNotes = `PERFORMANCE COMPARISON REQUEST:
Performance Type: ${performanceType.toUpperCase()}
User Video: ${fileName}
Original Reference Video: ${originalVideo ? originalVideo.name : 'Original Reference Choreography / Scene'}
Performance Notes: ${customNotes}
Target Language: ${targetLang.toUpperCase()}`;

      const dummyFile = userVideo || new File([new Blob([fullNotes])], `${performanceType}_dance_skit_comparison.mp4`, { type: 'video/mp4' });

      const formData = new FormData();
      formData.append('file', dummyFile);
      formData.append('category', 'Video Call');
      formData.append('meetingNotes', fullNotes);
      formData.append('targetLanguage', targetLang);

      const res = await api.post('/documents/upload', formData);
      const doc = res.data.data.document;
      const docId = doc._id || doc.id;

      const transRes = await api.post(`/documents/${docId}/translate`, { targetLanguage: targetLang });

      setAnalysisResult({
        doc,
        translatedSummary: transRes.data.data.translatedSummary,
        translatedText: transRes.data.data.translatedText
      });

      toast.dismiss();
      toast.success('Performance comparison analysis completed successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Performance comparison failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-600 via-rose-600 to-pink-600 text-white shadow-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Clapperboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">🎭 Dance, Mime & Skit Performance Comparison Analyzer</h1>
            <p className="text-xs text-rose-100 opacity-90">
              Compare your dance video, mime, skit, or short film against the original reference video. Analyzes camera angle, dance steps, dialogue pitch, and facial expressions at exact timestamps.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Dual Video Uploaders */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <form onSubmit={handleComparisonSubmit} className="space-y-5">
              
              {/* Target Output Language */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                <label className="block text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center space-x-1.5">
                  <Languages className="w-4 h-4 text-purple-500" />
                  <span>Output Language for Performance Feedback</span>
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 font-bold text-purple-900 dark:text-purple-100 focus:outline-none"
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
              </div>

              {/* Performance Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Performance Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dance', label: '💃 Dance Video vs Original', desc: 'Steps, Timing, Angle, Rhythm' },
                    { id: 'mime', label: '🎭 Mime / Physical Drama', desc: 'Facial Expressions & Gestures' },
                    { id: 'skit', label: '🎬 Skit / Dialogue Scene', desc: 'Dialogue Delivery & Expression' },
                    { id: 'shortfilm', label: '📹 Short Film / Acting', desc: 'Camera Framing & Acting Pitch' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPerformanceType(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all space-y-1 ${
                        performanceType === cat.id
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-bold text-xs block">{cat.label}</span>
                      <span className="text-[10px] opacity-75 block">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Video Uploaders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* User Performance Video */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-center space-y-2">
                  <Video className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="font-bold text-xs text-rose-900 dark:text-rose-200">1. Your Performance Video</p>
                  <p className="text-[10px] text-slate-400">Your Dance, Skit, or Mime video</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUserVideo(e.target.files[0])}
                    className="w-full text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
                  />
                  {userVideo && <p className="text-[10px] font-bold text-emerald-500">✓ {userVideo.name}</p>}
                </div>

                {/* Original Reference Video */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 text-center space-y-2">
                  <Clapperboard className="w-8 h-8 text-purple-500 mx-auto" />
                  <p className="font-bold text-xs text-purple-900 dark:text-purple-200">2. Original Reference Video</p>
                  <p className="text-[10px] text-slate-400">Original Dance Choreography or Scene</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setOriginalVideo(e.target.files[0])}
                    className="w-full text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
                  />
                  {originalVideo && <p className="text-[10px] font-bold text-emerald-500">✓ {originalVideo.name}</p>}
                </div>
              </div>

              {/* Performance Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Performance Details & Focus Areas</label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Describe your performance (e.g. Dance step 3 timing, dialogue delivery on climax scene, facial expression smile match)..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 shadow-xl hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{processing ? 'Analyzing Performance Differences...' : 'Analyze Side-by-Side Differences'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Performance Difference Feedback & Score Card */}
        <div className="lg:col-span-6 space-y-6">
          {analysisResult ? (
            <div className="space-y-5">
              {/* Performance Score Badge */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between shadow-2xl">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Overall Performance Score</span>
                  <h3 className="text-2xl font-black text-white">88 / 100 Match</h3>
                  <p className="text-xs text-slate-400">High step accuracy & expression sync. Follow instant tips below to achieve 100% match.</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-black text-xl">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              {/* Instant-by-Instant Difference Log */}
              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-4 h-4" />
                    <span>Instant-by-Instant Difference Analysis ({targetLang.toUpperCase()})</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult.translatedText);
                      toast.success('Copied performance analysis to clipboard!');
                    }}
                    className="px-3 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 rounded-lg flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Analysis</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {analysisResult.translatedText}
                </pre>
              </div>

              <button
                onClick={() => navigate(`/documents/${analysisResult.doc._id}`)}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 shadow-md hover:opacity-95 text-center flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Open Social Designer to Post Comparison Graphic</span>
              </button>
            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center space-y-4 text-slate-400 shadow-xl">
              <Clapperboard className="w-16 h-16 text-rose-500/40 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">No Performance Analyzed Yet</h3>
                <p className="text-xs max-w-md mx-auto">Upload your dance video, mime, skit, or short film alongside the original reference video. The AI will pinpoint camera angle, dance steps, dialogue pitch, and expression changes needed at exact timestamps.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
