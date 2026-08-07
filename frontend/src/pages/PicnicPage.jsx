import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  TreePine,
  Mic,
  Square,
  UploadCloud,
  Sparkles,
  Languages,
  CheckCircle2,
  List,
  MessageSquare,
  DollarSign,
  Radio,
  FileText,
  Video,
  Copy
} from 'lucide-react';

const PicnicPage = () => {
  const navigate = useNavigate();

  // Picnic Plan Input State
  const [destination, setDestination] = useState('Sunrise Lake Park');
  const [picnicDate, setPicnicDate] = useState('2026-08-10');
  const [groupMembers, setGroupMembers] = useState('Akhil, Rahul, Priya, Sneha & Family');
  const [foodItems, setFoodItems] = useState('Sandwiches, Fresh Juices, Snacks, Biryani, Water Bottles');
  const [gamesGear, setGamesGear] = useState('Cricket Set, Badminton Rackets, Portable Speaker, Camera');
  const [picnicNotes, setPicnicNotes] = useState('Planned lake view walk at 1:00 PM, followed by picnic lunch, group games and photography.');

  // User Specified Language
  const [targetLang, setTargetLang] = useState('te');

  // Input Mode: 'record' | 'upload'
  const [inputMode, setInputMode] = useState('record');
  const [picnicFile, setPicnicFile] = useState(null);

  // Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Submission & Result State
  const [processing, setProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setRecordedBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        toast.success('Picnic audio conversation recorded!');
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording picnic conversation speech...');
    } catch (err) {
      toast.error('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePicnicSubmit = async (e) => {
    e.preventDefault();

    setProcessing(true);
    toast.loading('Processing picnic conversation & generating multilingual memory log...');

    const combinedNotes = `Picnic Destination: ${destination}
Date: ${picnicDate}
Group Members: ${groupMembers}
Food & Snacks Basket: ${foodItems}
Games & Gear: ${gamesGear}
Picnic Notes & Itinerary: ${picnicNotes}`;

    const targetFile = picnicFile || (recordedBlob ? new File([recordedBlob], `${destination.replace(/\s+/g, '_')}_picnic.webm`, { type: 'audio/webm' }) : new File([new Blob([combinedNotes])], `${destination.replace(/\s+/g, '_')}_picnic_plan.txt`, { type: 'text/plain' }));

    const formData = new FormData();
    formData.append('file', targetFile);
    formData.append('category', 'Picnic & Outing');
    formData.append('meetingNotes', combinedNotes);
    formData.append('targetLanguage', targetLang);

    try {
      const res = await api.post('/documents/upload', formData);
      const doc = res.data.data.document;
      const docId = doc._id || doc.id;

      // Translate into specified language
      const transRes = await api.post(`/documents/${docId}/translate`, { targetLanguage: targetLang });

      setProcessedResult({
        doc,
        translatedSummary: transRes.data.data.translatedSummary,
        translatedText: transRes.data.data.translatedText
      });

      toast.dismiss();
      toast.success('Picnic conversation and checklist created successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Picnic processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl gradient-bg text-white shadow-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <TreePine className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">🧺 We Go For A Picnic Assistant</h1>
            <p className="text-xs text-indigo-100 opacity-90">
              Plan picnic outings, record live picnic audio conversations, track food & games checklist, and convert memories into your specified target language.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Picnic Form & Audio Recorder */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <form onSubmit={handlePicnicSubmit} className="space-y-4">
              
              {/* Target Language Dropdown */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5">
                  <Languages className="w-4 h-4 text-indigo-500" />
                  <span>Output Language for Picnic Memories</span>
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 font-bold text-indigo-900 dark:text-indigo-100 focus:outline-none"
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

              {/* Destination & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Picnic Spot / Park</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Sunrise Park"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Picnic Date</label>
                  <input
                    type="date"
                    value={picnicDate}
                    onChange={(e) => setPicnicDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Group Members */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Friends & Family Attending</label>
                <input
                  type="text"
                  value={groupMembers}
                  onChange={(e) => setGroupMembers(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  placeholder="Names of people going for picnic..."
                />
              </div>

              {/* Food & Snacks Basket */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Food & Snacks Basket List</label>
                <input
                  type="text"
                  value={foodItems}
                  onChange={(e) => setFoodItems(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  placeholder="Sandwiches, juices, biryani, fruits..."
                />
              </div>

              {/* Outdoor Games */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Outdoor Games & Equipment</label>
                <input
                  type="text"
                  value={gamesGear}
                  onChange={(e) => setGamesGear(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  placeholder="Cricket, badminton, speaker, camera..."
                />
              </div>

              {/* Picnic Speech / Audio Input Selector */}
              <div className="pt-2 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Picnic Audio / Vlog Conversation Input</label>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setInputMode('record')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 ${
                      inputMode === 'record' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>🎙️ Live Record Speech</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 ${
                      inputMode === 'upload' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>📁 Upload Picnic Video/Audio</span>
                  </button>
                </div>

                {inputMode === 'record' ? (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white text-center space-y-3">
                    <div className="font-mono text-xl text-purple-400 font-bold">{formatTimer(recordingSeconds)}</div>
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white space-x-1 inline-flex items-center"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Start Recording Picnic Audio</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white space-x-1 inline-flex items-center"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Recording</span>
                      </button>
                    )}
                    {recordedBlob && <p className="text-[11px] text-emerald-400 font-bold">✓ Audio recorded ({(recordedBlob.size / 1024).toFixed(1)} KB)</p>}
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="video/*,audio/*,image/*"
                    onChange={(e) => setPicnicFile(e.target.files[0])}
                    className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-xl hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{processing ? 'Processing Picnic Memories...' : 'Convert Picnic Plan & Conversation'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Output Multilingual Picnic Conversation & Checklist */}
        <div className="lg:col-span-6 space-y-6">
          {processedResult ? (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Pure Picnic Conversation Text ({targetLang.toUpperCase()})</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(processedResult.translatedText);
                      toast.success('Copied picnic conversation text!');
                    }}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-lg flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {processedResult.translatedText}
                </pre>
              </div>

              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 shadow-xl">
                <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Picnic Memory Summary</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {processedResult.translatedSummary}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center space-y-4 text-slate-400">
              <TreePine className="w-16 h-16 text-indigo-500/40 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">No Picnic Conversation Processed Yet</h3>
                <p className="text-xs">Fill out the picnic details on the left, record or upload your audio vlog, and click "Convert Picnic Plan & Conversation" to generate pure conversation text in your chosen language.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PicnicPage;
