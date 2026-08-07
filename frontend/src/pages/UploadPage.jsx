import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import {
  UploadCloud,
  Loader2,
  Sparkles,
  Video,
  FileText,
  Mic,
  Square,
  Languages,
  CheckCircle2,
  Radio,
  PhoneCall
} from 'lucide-react';

const UploadPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mode Selection: 'file' | 'phone' | 'record'
  const [activeMode, setActiveMode] = useState('file');

  // File Upload State
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('General');
  const [meetingNotes, setMeetingNotes] = useState('');

  // User Specified Language & Bullet Points Options
  const [targetLang, setTargetLang] = useState('te');
  const [outputFormat, setOutputFormat] = useState('bullets'); // 'bullets' | 'transcript' | 'minutes'

  // Live Audio / Phone Call Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Upload Progress State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Start Phone Call / Microphone Recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setRecordedBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        toast.success('Live phone call / conversation recorded successfully!');
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording live phone call / audio conversation...');
    } catch (err) {
      console.error(err);
      toast.error('Microphone access denied or unavailable.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 100 * 1024 * 1024) {
        toast.error('File size exceeds maximum 100MB limit.');
        return;
      }
      setFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 100 * 1024 * 1024) {
        toast.error('File size exceeds maximum 100MB limit.');
        return;
      }
      setFile(dropped);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    const targetFile = activeMode === 'record'
      ? (recordedBlob ? new File([recordedBlob], 'live_phone_call_audio.webm', { type: 'audio/webm' }) : null)
      : file;

    if (!targetFile) {
      toast.error(activeMode === 'record' ? 'Please record a call audio conversation first.' : 'Please select a file to upload.');
      return;
    }

    setUploading(true);
    setProgress(20);
    setStatusLog('Ingesting phone call / video audio into AI Engine...');

    const formData = new FormData();
    formData.append('file', targetFile);
    formData.append('category', activeMode === 'phone' ? 'Phone Call' : (activeMode === 'record' ? 'Phone Call' : category));
    formData.append('targetLanguage', targetLang);
    formData.append('outputFormat', outputFormat);

    if (meetingNotes) {
      formData.append('meetingNotes', meetingNotes);
    }

    try {
      setTimeout(() => {
        setProgress(50);
        setStatusLog('Transcribing Caller & Callee conversations...');
      }, 600);

      setTimeout(() => {
        setProgress(85);
        setStatusLog(`Translating phone call into user specified language (${targetLang.toUpperCase()})...`);
      }, 1400);

      const res = await api.post('/documents/upload', formData);

      const doc = res.data.data.document;
      const docId = doc._id || doc.id;

      try {
        await api.post(`/documents/${docId}/translate`, { targetLanguage: targetLang });
      } catch (e) { }

      setProgress(100);
      setStatusLog('Processing Complete!');
      toast.success('Phone call converted into text conversation in specified language!');

      setTimeout(() => {
        navigate(`/documents/${docId}`);
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Processing failed');
      setUploading(false);
      setProgress(0);
      setStatusLog('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.uploadTitle}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload document files, meeting videos, or phone call audio recordings (.m4a, .amr, .3gp, .mp3) to convert conversations into text in your chosen language.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => { setActiveMode('file'); setCategory('General'); }}
          className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${activeMode === 'file'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
              : 'glass-panel border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
            }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>📁 Upload File / Video</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveMode('phone'); setCategory('Phone Call'); }}
          className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${activeMode === 'phone'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
              : 'glass-panel border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
            }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>📞 Phone Call Audio (.m4a/.amr)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveMode('record'); setCategory('Lecture & Study Notes'); }}
          className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${activeMode === 'record'
              ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
              : 'glass-panel border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-500'
            }`}
        >
          <Mic className="w-4 h-4 text-red-400 animate-pulse" />
          <span>🎓 Record Live Lecture / Speech</span>
        </button>
      </div>

      {/* Video Call Expression Snapshot Banner Link */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500 text-white shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-purple-900 dark:text-purple-200">🎥 Live Video Call & Facial Expression Snapshot Recorder</h4>
            <p className="text-[11px] text-purple-700 dark:text-purple-300">Takes photo snapshots of facial expressions during live calls and pairs them with spoken conversation text at exact timestamps.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/videocall')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all whitespace-nowrap"
        >
          Open Video Call Recorder →
        </button>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <form onSubmit={handleUploadSubmit} className="space-y-6">

          {/* User Specified Output Language Dropdown */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  User Specified Output Language for Exam Revision & Notes
                </label>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Converts live classroom lecture speech into study revision notes in your chosen language</p>
              </div>
            </div>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
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
          </div>

          {/* Mode 1 & 2: File / Phone Call Upload */}
          {(activeMode === 'file' || activeMode === 'phone') && (
            <>
              {activeMode === 'file' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t.categoryLabel}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['General', 'Lecture & Study Notes', 'Meeting Video', 'Phone Call', 'Invoice', 'Receipt', 'Contract', 'Report'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${category === cat
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                          }`}
                      >
                        {cat === 'Lecture & Study Notes' ? '🎓 Lecture Notes' : cat === 'Meeting Video' ? '🎥 Video' : cat === 'Phone Call' ? '📞 Call Audio' : cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500'
                  }`}
              >
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.tiff,.txt,.mp4,.webm,.avi,.mov,.mkv,.mp3,.wav,.m4a,.ogg,.amr,.3gp,.aac,.flac"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <label htmlFor="file-input" className="cursor-pointer space-y-3 block">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                    {activeMode === 'phone' || (file && (file.name.endsWith('.m4a') || file.name.endsWith('.amr') || file.name.endsWith('.3gp'))) ? (
                      <PhoneCall className="w-8 h-8 text-emerald-500" />
                    ) : file && (file.type.startsWith('video/') || file.type.startsWith('audio/')) ? (
                      <Video className="w-8 h-8 text-purple-500" />
                    ) : (
                      <UploadCloud className="w-8 h-8" />
                    )}
                  </div>

                  {file ? (
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                        {activeMode === 'phone' ? 'Upload Phone Call Audio Recording (.m4a, .amr, .3gp, .mp3, .wav)' : t.dragDropText}
                      </p>
                      <p className="text-xs text-slate-400">
                        Supports Phone Call M4A, AMR, 3GP, MP3, WAV, AAC & Video Files (Max 100MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </>
          )}

          {/* Mode 3: Live Phone Call Microphone Recorder */}
          {activeMode === 'record' && (
            <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500 text-purple-400 mx-auto flex items-center justify-center relative">
                  {isRecording && (
                    <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></span>
                  )}
                  <PhoneCall className={`w-10 h-10 ${isRecording ? 'text-red-500 animate-pulse' : 'text-purple-400'}`} />
                </div>
                <h3 className="font-bold text-lg text-white">Live Phone Call / Audio Conversation Recorder</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Record live phone conversations from your microphone or call speaker. Converts spoken dialogue into pure text in your specified language.
                </p>
              </div>

              {/* Timer & Waveform Display */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-xs mx-auto space-y-2">
                <div className="text-2xl font-mono font-bold text-purple-400 tracking-wider">
                  {formatTimer(recordingSeconds)}
                </div>
                <div className="flex justify-center items-center space-x-1 h-6">
                  {[40, 70, 30, 90, 50, 100, 60, 80, 40, 90, 60, 30].map((h, idx) => (
                    <div
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-300 ${isRecording ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'
                        }`}
                      style={{ height: isRecording ? `${Math.max(20, (h * Math.random()).toFixed(0))}%` : '20%' }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Start Call Audio Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-6 py-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              {recordedBlob && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Call recording ready for conversion ({(recordedBlob.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar & Log */}
          {uploading && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-900 text-white font-mono text-xs">
              <div className="flex justify-between font-semibold">
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{statusLog}</span>
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={(activeMode === 'record' ? !recordedBlob : !file) || uploading}
            className="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-xl hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {uploading
                ? t.uploadingBtn
                : activeMode === 'phone'
                  ? 'Convert Phone Call Audio to Text'
                  : activeMode === 'record'
                    ? 'Convert Phone Recording to Text'
                    : 'Convert & Extract Text Conversation'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
