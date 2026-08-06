import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
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
  AlertTriangle,
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
  CheckCircle,
  ShieldAlert
} from 'lucide-react';

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  if (loading) return <DetailSkeleton />;
  if (!document) return null;

  const entities = document.extractedEntities || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{document.originalName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                  {document.fileCategory}
                </span>
                {document.ocrApplied && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                    <Scan className="w-3 h-3" /> OCR Applied
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Uploaded on {new Date(document.createdAt).toLocaleString()} • {(document.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <Link
              to={`/chat?doc=${document._id}`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg shadow-md hover:opacity-95 transition-opacity flex items-center space-x-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </Link>

            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              <span>Re-Analyze</span>
            </button>

            <a
              href={`/api/documents/${document._id}/download?format=json`}
              download
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </a>

            <a
              href={`/api/documents/${document._id}/download?format=txt`}
              download
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export TXT Report</span>
            </a>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pt-2">
          {[
            { id: 'summary', label: 'AI Summary & Risks' },
            { id: 'entities', label: 'Extracted Entities' },
            { id: 'tables', label: 'Parsed Tables' },
            { id: 'raw', label: 'Raw Extracted Text' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
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

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Executive Summary</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {document.summary || 'Summary not generated.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              {document.keywords?.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Risk Flags */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Risk & Compliance Flags</span>
            </h3>

            {document.riskFlags && document.riskFlags.length > 0 ? (
              <div className="space-y-3">
                {document.riskFlags.map((risk, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-1 ${
                      risk.severity === 'High'
                        ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                        : risk.severity === 'Medium'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider">[{risk.severity} Severity] {risk.issue}</span>
                    </div>
                    <p className="text-xs opacity-90">{risk.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-400">No risk flags detected in this document.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EntityCard icon={User} title="Names Extracted" items={entities.names} color="indigo" />
          <EntityCard icon={Mail} title="Email Addresses" items={entities.emails} color="emerald" />
          <EntityCard icon={Phone} title="Phone Numbers" items={entities.phoneNumbers} color="purple" />
          <EntityCard icon={MapPin} title="Physical Addresses" items={entities.addresses} color="blue" />
          <EntityCard icon={Calendar} title="Important Dates" items={entities.dates} color="amber" />
          <EntityCard icon={CreditCard} title="Invoice Numbers" items={entities.invoiceNumbers} color="pink" />
          <EntityCard icon={Building} title="GSTIN Identifiers" items={entities.gstNumbers} color="emerald" />
          <EntityCard icon={Tag} title="PAN Numbers" items={entities.panNumbers} color="indigo" />
          <EntityCard icon={DollarSign} title="Amounts & Pricing" items={entities.amounts} color="amber" />
        </div>
      )}

      {activeTab === 'tables' && (
        <div className="p-6 rounded-2xl glass-panel space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <TableIcon className="w-5 h-5 text-indigo-500" />
            <span>Extracted Tabular Data</span>
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

      {activeTab === 'raw' && (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Raw Extracted Text</h3>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
            {document.textExtracted || 'No text extracted.'}
          </pre>
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
