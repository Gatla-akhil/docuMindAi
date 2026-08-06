import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  FileText,
  HardDrive,
  Scan,
  CheckCircle,
  UploadCloud,
  ArrowUpRight,
  TrendingUp,
  Activity,
  FileCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const { cards, charts, recentActivity } = data || {
    cards: { totalDocuments: 0, totalStorageMB: 0, ocrProcessed: 0, completedRate: 100 },
    charts: { categoryDistribution: [], documentTypes: [], dailyUploadTrend: [] },
    recentActivity: []
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time telemetry on document ingestion, OCR execution, and AI parsing.
          </p>
        </div>
        <Link
          to="/upload"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white gradient-bg shadow-lg hover:opacity-95 transition-opacity flex items-center space-x-2 w-fit"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New File</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Documents',
            value: cards.totalDocuments,
            sub: 'Processed across all formats',
            icon: FileText,
            color: 'text-indigo-500 bg-indigo-500/10'
          },
          {
            title: 'Storage Occupied',
            value: `${cards.totalStorageMB} MB`,
            sub: 'Sanitized storage allocation',
            icon: HardDrive,
            color: 'text-purple-500 bg-purple-500/10'
          },
          {
            title: 'OCR Executions',
            value: cards.ocrProcessed,
            sub: 'Tesseract vision applied',
            icon: Scan,
            color: 'text-emerald-500 bg-emerald-500/10'
          },
          {
            title: 'Pipeline Success',
            value: `${cards.completedRate}%`,
            sub: 'No error rate',
            icon: CheckCircle,
            color: 'text-amber-500 bg-amber-500/10'
          }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-6 rounded-2xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{card.value}</div>
              <p className="text-xs text-slate-400 dark:text-slate-500">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span>7-Day Document Ingestion Velocity</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.dailyUploadTrend}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="uploads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Distribution */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Category Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {charts.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <span>Recent System Activity Log</span>
          </h3>
          <Link to="/history" className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1">
            View All Documents <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentActivity.length > 0 ? (
            recentActivity.map((log) => (
              <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <p className="text-slate-500 dark:text-slate-400">{log.details}</p>
                  </div>
                </div>
                <span className="text-slate-400 dark:text-slate-500">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <p className="py-4 text-xs text-slate-400 italic">No recent system activity recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
