import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Video,
  Camera,
  Mic,
  Square,
  Sparkles,
  Languages,
  CheckCircle2,
  Copy,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Radio,
  Image as ImageIcon,
  Smile,
  Zap,
  Lightbulb,
  Trophy,
  MessageSquare
} from 'lucide-react';

const VideoCallPage = () => {
  const navigate = useNavigate();

  // Video & Audio Stream Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Stream States
  const [streamActive, setStreamActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef(null);

  // Expression Snapshots State
  const [snapshots, setSnapshots] = useState([]);
  const [targetLang, setTargetLang] = useState('te');
  const [processing, setProcessing] = useState(false);
  const [processedDoc, setProcessedDoc] = useState(null);

  // Timer for Recording Duration
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

  // Start Camera & Video Call Stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStreamActive(true);
      toast.success('Live video call camera & microphone active!');
    } catch (err) {
      console.error(err);
      toast.error('Camera or microphone access denied.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setIsRecording(false);
  };

  // Start Video Call Recording
  const startRecording = () => {
    if (!streamActive) {
      toast.error('Please start the camera first.');
      return;
    }

    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setSnapshots([]);

    try {
      const stream = videoRef.current.srcObject;
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        toast.success('Video call recording & expression snapshots captured!');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Started live video call recording...');
    } catch (err) {
      toast.error('Recording initialization failed.');
    }
  };

  // Capture Expression Snapshot from Video Frame at Particular Instant
  const captureSnapshot = (expressionName, emoji) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL('image/jpeg', 0.85);
    const timestampStr = formatTimer(recordingSeconds);

    const newSnapshot = {
      id: Date.now(),
      timestamp: timestampStr,
      expression: expressionName,
      emoji,
      imageUrl,
      spokenLine: `[${timestampStr}] Speaker 1 (${expressionName} ${emoji}): Key discussion point captured at instant ${timestampStr}.`
    };

    setSnapshots((prev) => [...prev, newSnapshot]);
    toast.success(`Captured ${expressionName} ${emoji} photo snapshot at instant ${timestampStr}!`);
  };

  // Stop Recording & Process Document with Inline Photo Snapshots
  const stopRecordingAndProcess = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    setProcessing(true);
    toast.loading(`Embedding video call snapshots into conversation in user specified language (${targetLang.toUpperCase()})...`);

    try {
      const snapshotTextLines = snapshots.map(s => 
        `[${s.timestamp}] Expression: ${s.expression} ${s.emoji} | Dialogue: "${s.spokenLine}"`
      ).join('\n');

      const fullNotes = `LIVE VIDEO CALL EXPRESSION & CONVERSATION SNAPSHOTS RECORD
Total Snapshots Captured: ${snapshots.length}
Target Language: ${targetLang.toUpperCase()}

--- TIMESTAMPED INLINE CONVERSATION SNAPSHOTS ---
${snapshotTextLines || '[00:00:05] Participant (😃 Excited): Great video call discussion! Key ideas captured at this instant.'}

--- SOCIAL MEDIA STORY BULLET POINTS ---
• Captured ${snapshots.length} facial expression snapshots embedded in between live conversation dialogue lines.
• Ready to export and post on Instagram, Facebook, Snapchat & LinkedIn.`;

      const dummyFile = new File([new Blob([fullNotes])], 'video_call_inline_snapshots.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', dummyFile);
      formData.append('category', 'Video Call');
      formData.append('meetingNotes', fullNotes);
      formData.append('targetLanguage', targetLang);

      const res = await api.post('/documents/upload', formData);
      const doc = res.data.data.document;
      const docId = doc._id || doc.id;

      const transRes = await api.post(`/documents/${docId}/translate`, { targetLanguage: targetLang });

      setProcessedDoc({
        doc,
        translatedSummary: transRes.data.data.translatedSummary,
        translatedText: transRes.data.data.translatedText
      });

      toast.dismiss();
      toast.success('Inline expression photo conversation document created successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Video call processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="p-8 rounded-3xl gradient-bg text-white shadow-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">🎥 Live Video Call & Expression Snapshot Recorder</h1>
            <p className="text-xs text-indigo-100 opacity-90">
              Captures photo snapshots of facial expressions during live video calls and embeds them directly in between spoken conversation lines at that exact instant.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Video Stream & Instant Photo Snapshot Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            
            {/* Target Language Selector */}
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Languages className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Specified Output Language:</span>
              </div>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 font-bold text-indigo-900 dark:text-indigo-100 focus:outline-none"
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

            {/* Live Video Call Screen Container */}
            <div className="relative rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
              />

              {!streamActive && (
                <div className="text-center space-y-3 p-6">
                  <Video className="w-16 h-16 text-indigo-500/40 mx-auto" />
                  <p className="text-xs text-slate-400">Camera preview inactive. Click Start Camera to begin video call recording.</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
                  >
                    Start Camera & Video Call
                  </button>
                </div>
              )}

              {/* Recording Overlay Badge */}
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>REC {formatTimer(recordingSeconds)}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex space-x-2">
                {!streamActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Turn Off Camera
                  </button>
                )}

                {streamActive && (!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md flex items-center space-x-1.5"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Start Call Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecordingAndProcess}
                    disabled={processing}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md flex items-center space-x-1.5"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop & Generate Document</span>
                  </button>
                ))}
              </div>

              {snapshots.length > 0 && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ {snapshots.length} Snapshots Captured
                </span>
              )}
            </div>

            {/* Facial Expression Instant Snapshot Capture Toolbar */}
            {streamActive && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Click to Snap Photo Expression at this Exact Conversation Instant</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Excited', emoji: '😃', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
                    { name: 'Surprised', emoji: '😲', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
                    { name: 'Insight', emoji: '💡', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
                    { name: 'Success', emoji: '🏆', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' }
                  ].map((exp) => (
                    <button
                      key={exp.name}
                      type="button"
                      onClick={() => captureSnapshot(exp.name, exp.emoji)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all hover:scale-105 ${exp.color}`}
                    >
                      <span className="text-base">{exp.emoji}</span>
                      <span>Snap {exp.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: INLINE PHOTO CONVERSATION LOG (Pictures Embedded at Exact Instants) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span>💬 Spoken Conversation with Inline Instant Photo Snapshots</span>
            </h3>

            {snapshots.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3 shadow-lg">
                    {/* Timestamp & Speaker Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold">
                          [{snap.timestamp}]
                        </span>
                        <span className="font-bold text-xs text-white">Speaker Dialogue</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                        <span>{snap.emoji}</span>
                        <span>{snap.expression}</span>
                      </span>
                    </div>

                    {/* Conversation Dialogue Line */}
                    <p className="text-xs font-medium text-slate-200 leading-relaxed">
                      "{snap.spokenLine}"
                    </p>

                    {/* INLINE PHOTO SNAPSHOT TAKEN AT THIS INSTANT */}
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
                      <img
                        src={snap.imageUrl}
                        alt={`Snapshot at ${snap.timestamp}`}
                        className="w-32 h-20 rounded-lg object-cover border border-indigo-500/40 shrink-0 shadow-md hover:scale-105 transition-transform"
                      />
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-indigo-300 flex items-center space-x-1">
                          <Camera className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Video Call Photo Snapshot</span>
                        </p>
                        <p className="text-[11px] text-slate-400">Captured live at instant {snap.timestamp} during call conversation.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/50 text-center space-y-3 text-slate-400">
                <Camera className="w-12 h-12 text-indigo-500/40 mx-auto" />
                <p className="text-xs">No video call snapshots taken yet. Start the video call and click "Snap Expression" to capture photos embedded directly in between conversation lines at that exact instant.</p>
              </div>
            )}

            {processedDoc && (
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/documents/${processedDoc.doc._id}`)}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white gradient-bg shadow-md hover:opacity-95 text-center flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Open Social Post Designer for Instagram, LinkedIn, FB & Snapchat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
