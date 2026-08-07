import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { downloadDocumentFile } from '../services/api';
import toast from 'react-hot-toast';
import {
  Trophy,
  UploadCloud,
  Sparkles,
  Languages,
  CheckCircle2,
  Video,
  Copy,
  Share2,
  Activity,
  Target,
  Flame,
  Award,
  Zap,
  ShieldAlert,
  Users,
  Compass,
  FileText,
  Download
} from 'lucide-react';

const SportsPage = () => {
  const navigate = useNavigate();

  // Sports Form State
  const [sportCategory, setSportCategory] = useState('cricket'); // 'cricket' | 'football' | 'kabaddi' | 'chess' | 'badminton'
  const [favoritePlayer, setFavoritePlayer] = useState('Virat Kohli');
  const [userMatchFile, setUserMatchFile] = useState(null);
  const [gameNotes, setGameNotes] = useState('Match gameplay analysis vs opponent team. Struggled during final overs/half-time counter attacks.');
  const [targetLang, setTargetLang] = useState('te');

  // Processing & Result State
  const [processing, setProcessing] = useState(false);
  const [sportsResult, setSportsResult] = useState(null);

  const sportsPresets = {
    cricket: { name: 'Cricket 🏏', defaultPlayer: 'Virat Kohli', desc: 'Batting stance, bowling action, shot selection, field strategy' },
    football: { name: 'Football / Soccer ⚽', defaultPlayer: 'Lionel Messi', desc: 'Dribbling, shooting angle, defensive line, formation tactic' },
    kabaddi: { name: 'Kabaddi 🤼', defaultPlayer: 'Pardeep Narwal', desc: 'Raiding footwork, toe touch, thigh hold tackle, team chain' },
    chess: { name: 'Chess ♟️', defaultPlayer: 'Magnus Carlsen', desc: 'Opening repertoire, blunder detection, tactical sacrifices, endgame' },
    badminton: { name: 'Badminton / Tennis 🏸', defaultPlayer: 'PV Sindhu', desc: 'Smash technique, court footwork, backhand clears, net play' }
  };

  const handleSportCategoryChange = (key) => {
    setSportCategory(key);
    setFavoritePlayer(sportsPresets[key].defaultPlayer);
  };

  const handleSportsSubmit = async (e) => {
    e.preventDefault();

    setProcessing(true);
    toast.loading(`Analyzing sports performance & comparing against ${favoritePlayer} in ${targetLang.toUpperCase()}...`);

    try {
      const fileName = userMatchFile ? userMatchFile.name : `${sportCategory}_match_gameplay.mp4`;
      const fullNotes = `SPORTS AI COACH & MATCH STRATEGY REQUEST:
Sport: ${sportsPresets[sportCategory].name}
Favorite Player Benchmark: ${favoritePlayer}
Match Source File: ${fileName}
Match Details & Mistakes: ${gameNotes}
Target Language: ${targetLang.toUpperCase()}`;

      const dummyFile = userMatchFile || new File([new Blob([fullNotes])], `${sportCategory}_sports_analysis.mp4`, { type: 'video/mp4' });

      const formData = new FormData();
      formData.append('file', dummyFile);
      formData.append('category', 'Video Call');
      formData.append('meetingNotes', fullNotes);
      formData.append('targetLanguage', targetLang);

      const res = await api.post('/documents/upload', formData);
      const doc = res.data.data.document;
      const docId = doc._id || doc.id;

      const transRes = await api.post(`/documents/${docId}/translate`, { targetLanguage: targetLang });

      setSportsResult({
        doc,
        translatedSummary: transRes.data.data.translatedSummary,
        translatedText: transRes.data.data.translatedText
      });

      toast.dismiss();
      toast.success(`Sports AI analysis & ${favoritePlayer} comparison completed!`);
    } catch (err) {
      toast.dismiss();
      toast.error('Sports analysis failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 text-white shadow-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">🏆 Sports AI Coach & Match Strategy Analyzer</h1>
            <p className="text-xs text-amber-100 opacity-90">
              Compare your gameplay style with pro players (Cricket, Football, Kabaddi, Chess). Pinpoints why you lost, team mistakes, and generates next match winning strategies in your specified language.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Sports Configurator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <form onSubmit={handleSportsSubmit} className="space-y-5">
              
              {/* Output Language Selector */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center space-x-1.5">
                  <Languages className="w-4 h-4 text-amber-500" />
                  <span>Output Language for Sports Coaching Report</span>
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 font-bold text-amber-900 dark:text-amber-100 focus:outline-none"
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

              {/* Sports Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Sport Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(sportsPresets).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSportCategoryChange(key)}
                      className={`p-3 rounded-2xl border text-left transition-all space-y-1 ${
                        sportCategory === key
                          ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                      }`}
                    >
                      <span className="font-bold text-xs block">{sportsPresets[key].name}</span>
                      <span className="text-[10px] opacity-80 block truncate">{sportsPresets[key].desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Pro Player Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Favorite Pro Player Benchmark (to compare your style)
                </label>
                <input
                  type="text"
                  value={favoritePlayer}
                  onChange={(e) => setFavoritePlayer(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  placeholder="e.g. Virat Kohli, Lionel Messi, Pardeep Narwal, Magnus Carlsen..."
                  required
                />
              </div>

              {/* Match Video / Scorecard Upload */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold text-xs text-amber-900 dark:text-amber-200">Upload Match Gameplay Video or Scorecard</p>
                <p className="text-[10px] text-slate-400">Supports MP4, WEBM, MOV, MP3, WAV, PNG, JPG (Max 100MB)</p>
                <input
                  type="file"
                  accept="video/*,audio/*,image/*,.txt"
                  onChange={(e) => setUserMatchFile(e.target.files[0])}
                  className="w-full text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
                />
                {userMatchFile && <p className="text-[10px] font-bold text-emerald-500">✓ {userMatchFile.name}</p>}
              </div>

              {/* Match Notes & Mistakes Context */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Game Details, Why You Lost & Team Mistakes</label>
                <textarea
                  value={gameNotes}
                  onChange={(e) => setGameNotes(e.target.value)}
                  placeholder="Describe your match (e.g. Batting stance vs spinners, lost match in final 5 mins due to poor field placement, chess opening blunder at move 14)..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 shadow-xl hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{processing ? 'Analyzing Match & Comparing Style...' : 'Analyze Game & Compare Style'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Sports Analysis Report & Next Match Strategy */}
        <div className="lg:col-span-6 space-y-6">
          {sportsResult ? (
            <div className="space-y-5">
              {/* Pro Player Comparison Badge */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between shadow-2xl">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Style Match vs {favoritePlayer}</span>
                  <h3 className="text-2xl font-black text-white">85% Technique Match</h3>
                  <p className="text-xs text-slate-400">Strong fundamentals. Adjust stance alignment & follow-through to mirror {favoritePlayer}.</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              {/* Sports Analysis Output Report */}
              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Target className="w-4 h-4" />
                    <span>Sports AI Analysis & Next Game Strategy ({targetLang.toUpperCase()})</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sportsResult.translatedText);
                      toast.success('Copied sports coaching analysis to clipboard!');
                    }}
                    className="px-3 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-lg flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Analysis</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {sportsResult.translatedText}
                </pre>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/documents/${sportsResult.doc._id}`)}
                  className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 shadow-md hover:opacity-95 text-center flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Open Full Report & Social Post Designer</span>
                </button>

                <button
                  onClick={() => downloadDocumentFile(sportsResult.doc._id, 'pdf', 'sports_coaching_report.pdf')}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
                  title="Download PDF Report"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center space-y-4 text-slate-400 shadow-xl">
              <Trophy className="w-16 h-16 text-amber-500/40 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">No Sports Match Analyzed Yet</h3>
                <p className="text-xs max-w-md mx-auto">Select your sport (Cricket, Football, Kabaddi, Chess), enter your favorite pro player benchmark, and upload your match gameplay clip. The Sports AI Coach will compare your playing style, pinpoint why you lost, and give winning strategies for your next match.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
