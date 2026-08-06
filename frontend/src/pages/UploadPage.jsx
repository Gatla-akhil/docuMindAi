import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('General');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 25 * 1024 * 1024) {
        toast.error('File size exceeds maximum 25MB limit.');
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
      if (dropped.size > 25 * 1024 * 1024) {
        toast.error('File size exceeds maximum 25MB limit.');
        return;
      }
      setFile(dropped);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF, DOCX, or Image file to upload.');
      return;
    }

    setUploading(true);
    setProgress(15);
    setStatusLog('Uploading file to secure processing server...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      setTimeout(() => {
        setProgress(50);
        setStatusLog('Executing Tesseract OCR & Text Extractor...');
      }, 800);

      setTimeout(() => {
        setProgress(80);
        setStatusLog('Running Gemini AI Entity & Table Extraction...');
      }, 1800);

      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProgress(100);
      setStatusLog('Processing Complete!');
      toast.success('Document uploaded and parsed successfully!');

      const docId = res.data.data.document._id;
      setTimeout(() => {
        navigate(`/documents/${docId}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'File upload failed');
      setUploading(false);
      setProgress(0);
      setStatusLog('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload & Analyze Document</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your PDF, DOCX, or scanned Image files to trigger instant AI character recognition, entity extraction, and risk detection.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Document Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['General', 'Invoice', 'Receipt', 'Contract', 'Tax Document', 'Identity ID', 'Report'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500'
            }`}
          >
            <input
              type="file"
              id="file-input"
              className="hidden"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.tiff"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="file-input" className="cursor-pointer space-y-3 block">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                <UploadCloud className="w-8 h-8" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                    Click to browse or drag and drop your document
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports PDF, DOCX, PNG, JPG, WEBP, TIFF (Max 25MB)
                  </p>
                </div>
              )}
            </label>
          </div>

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
            disabled={!file || uploading}
            className="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-xl hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>{uploading ? 'Processing AI Pipeline...' : 'Upload & Process File'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
