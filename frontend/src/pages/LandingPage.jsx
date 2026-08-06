import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Brain,
  Scan,
  ShieldCheck,
  Zap,
  Search,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  FileCheck,
  Upload,
  Cpu
} from 'lucide-react';

const LandingPage = () => {
  const [demoText, setDemoText] = useState('');
  const [demoStatus, setDemoStatus] = useState('');

  const runDemoOCR = () => {
    setDemoStatus('Scanning document image with Tesseract OCR...');
    setDemoText('');

    setTimeout(() => {
      setDemoStatus('Executing Gemini AI Entity & Table Extraction...');
    }, 1200);

    setTimeout(() => {
      setDemoStatus('Extraction Complete!');
      setDemoText(`[Extracted Document Metadata]
• Invoice No: INV-2026-9041
• Supplier: TechCorp Systems Pvt Ltd
• GSTIN: 27AAAAA0000A1Z5
• Total Amount: $4,850.00
• PAN: ABCDE1234F
• Dates: 2026-08-01
• Risk Flags: 0 detected (100% Compliant)`);
    }, 2500);
  };

  return (
    <div className="min-h-screen space-y-24 pb-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="w-[400px] h-[400px] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Enterprise IDP Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Transform Raw Documents into <br />
            <span className="gradient-text">Actionable AI Intelligence</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Automate PDF, DOCX, and scanned image processing with optical character recognition (OCR), entity extraction, tables parsing, and conversational AI document Q&A.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white gradient-bg shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 glass-card hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive OCR Demo */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Live OCR & AI Extraction Demo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Test character recognition and entity parsing in real-time</p>
              </div>
            </div>
            <button
              onClick={runDemoOCR}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-md"
            >
              <Cpu className="w-4 h-4" />
              <span>Simulate OCR Pipeline</span>
            </button>
          </div>

          {demoStatus && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center space-x-2 animate-pulse">
              <Zap className="w-4 h-4" />
              <span>{demoStatus}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs h-40 overflow-y-auto leading-relaxed border border-slate-800">
            {demoText || '// Click "Simulate OCR Pipeline" to witness instant AI extraction from raw scanned files...'}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            End-to-End Intelligent Document Workflow
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
            Powered by Tesseract OCR, Google Gemini 1.5, and automated document standardizers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Upload,
              title: 'Multi-Format Processing',
              desc: 'Upload PDFs, Word documents (DOCX), and scanned images (PNG, JPG, TIFF) up to 25MB with auto-preprocessing.'
            },
            {
              icon: Scan,
              title: 'Tesseract OCR & Sharp',
              desc: 'Enhance scanned documents automatically with contrast normalization, sharpening, and optical character recognition.'
            },
            {
              icon: Brain,
              title: 'Gemini AI Entities & Tables',
              desc: 'Automatically extract names, emails, phone numbers, PAN, GSTIN, dates, invoice amounts, and tabular data.'
            },
            {
              icon: MessageSquare,
              title: 'Conversational Document Q&A',
              desc: 'Ask complex contextual questions about uploaded documents and receive instant answers backed by document evidence.'
            },
            {
              icon: Search,
              title: 'Global Multi-Criteria Search',
              desc: 'Locate any document in seconds searching across extracted text, titles, categories, dates, or vendor names.'
            },
            {
              icon: ShieldCheck,
              title: 'Compliance & Risk Detection',
              desc: 'Automatically spot high-risk financial flags, missing fields, or compliance anomalies in contracts and invoices.'
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 rounded-2xl glass-card space-y-3 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="p-8 rounded-3xl gradient-bg text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-bold">Enterprise Security & Encryption Built-In</h3>
            <p className="text-indigo-100 text-sm">
              All documents are sanitized, stored with strict role-based access control, JWT refresh verification, and Express Helmet security headers.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl font-bold bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg whitespace-nowrap"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
