import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadDocumentFile } from '../services/api';
import toast from 'react-hot-toast';
import { TableRowSkeleton } from '../components/LoadingSkeleton';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  FileText,
  Scan,
  Download,
  Trash2,
  MessageSquare,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

const HistoryPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');

  const [deleteDoc, setDeleteDoc] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = `/documents?page=${page}&limit=10`;
      if (category) url += `&category=${category}`;

      const res = await api.get(url);
      setDocuments(res.data.data.documents || []);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, category]);

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    const docId = deleteDoc._id || deleteDoc.id;
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted.');
      fetchHistory();
    } catch (err) {
      toast.error('Failed to delete document.');
    } finally {
      setDeleteDoc(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document History & Archive</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, inspect, re-process, download reports, or delete previously processed documents.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="">All Categories</option>
            <option value="Invoice">Invoice</option>
            <option value="Receipt">Receipt</option>
            <option value="Contract">Contract</option>
            <option value="Tax Document">Tax Document</option>
            <option value="Identity ID">Identity ID</option>
            <option value="Report">Report</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Document Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Size</th>
                <th className="p-4">OCR Status</th>
                <th className="p-4">Date Uploaded</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : documents.length > 0 ? (
                documents.map((doc) => {
                  const docId = doc._id || doc.id;
                  return (
                    <tr key={docId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-xs">{doc.originalName}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold">
                          {doc.fileCategory}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {(doc.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="p-4">
                        {doc.ocrApplied ? (
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <Scan className="w-3 h-3" /> OCR
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          to={`/documents/${docId}`}
                          className="p-1.5 text-indigo-500 hover:text-indigo-600 inline-block"
                          title="View Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/chat?doc=${docId}`}
                          className="p-1.5 text-purple-500 hover:text-purple-600 inline-block"
                          title="Launch AI Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => downloadDocumentFile(docId, 'json', `${doc.originalName || 'document'}-analysis.json`)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 inline-block"
                          title="Download JSON Analysis"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteDoc(doc)}
                          className="p-1.5 text-red-500 hover:text-red-600 inline-block"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No documents found in history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteDoc}
        title="Delete Document"
        message={deleteDoc ? `Are you sure you want to delete '${deleteDoc.originalName}'?` : ''}
        confirmText="Delete"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteDoc(null)}
      />
    </div>
  );
};

export default HistoryPage;
