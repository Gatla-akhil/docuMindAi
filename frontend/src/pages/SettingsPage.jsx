import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, Cpu, Key, Sliders, Save, CheckCircle2 } from 'lucide-react';

const SettingsPage = () => {
  const [ocrConfidence, setOcrConfidence] = useState(75);
  const [exportFormat, setExportFormat] = useState('json');
  const [autoOcr, setAutoOcr] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Platform configuration preferences saved.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure OCR sensitivity thresholds, Gemini AI integrations, and export preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Gemini API Status */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Google Gemini API Connection</h3>
              <p className="text-xs text-slate-400">Configured via backend environment variable (`GEMINI_API_KEY`)</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            Active / Fallback Ready
          </span>
        </div>

        {/* OCR Sensitivity Threshold */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tesseract OCR Scanned Trigger Threshold ({ocrConfidence}%)
            </label>
            <Sliders className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={ocrConfidence}
            onChange={(e) => setOcrConfidence(e.target.value)}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <p className="text-[11px] text-slate-400">
            Documents with low native text yield below this threshold will automatically trigger Sharp image enhancement and Tesseract OCR.
          </p>
        </div>

        {/* Export Preference */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Default Download Report Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExportFormat('json')}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                exportFormat === 'json'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Structured JSON Data
            </button>
            <button
              type="button"
              onClick={() => setExportFormat('txt')}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                exportFormat === 'txt'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Plain Text (.TXT) Report
            </button>
          </div>
        </div>

        {/* Auto OCR Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div>
            <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Automatic OCR Fallback</h4>
            <p className="text-[11px] text-slate-400">Automatically run Tesseract vision on images & low-quality scanned PDFs</p>
          </div>
          <input
            type="checkbox"
            checked={autoOcr}
            onChange={(e) => setAutoOcr(e.target.checked)}
            className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-white gradient-bg shadow-md hover:opacity-95 transition-opacity flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Preference Settings</span>
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
