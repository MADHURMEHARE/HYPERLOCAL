import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Bot, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  Globe, 
  TrendingUp, 
  MapPin,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { AIService } from '../../services/AIService';
import { AIIncident } from '../../types';
import IncidentCard from '../../components/AI/IncidentCard';

interface AIDashboardProps {
  onNavigate: (view: string) => void;
}

export default function AIDashboard({ onNavigate }: AIDashboardProps) {
  const [incidents, setIncidents] = useState<AIIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AIService.fetchAllIncidents();
      setIncidents(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load intelligence data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await AIService.triggerNewsMonitorCrawl();
      const data = await AIService.fetchAllIncidents();
      setIncidents(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setVerifyingId(id);
      await AIService.verifyIncident(id);
      // Update local state
      setIncidents(prev => prev.map(item => item.id === id ? { ...item, verified: true, status: 'Verified' } : item));
    } catch (e: any) {
      alert(e.message || 'Failed to verify incident.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    if (!confirm('Are you sure you want to dismiss and delete this AI alert?')) return;
    try {
      setDismissingId(id);
      await AIService.dismissIncident(id);
      setIncidents(prev => prev.filter(item => item.id !== id));
    } catch (e: any) {
      alert(e.message || 'Failed to dismiss incident.');
    } finally {
      setDismissingId(null);
    }
  };

  const metrics = AIService.getMetrics(incidents);

  // Format Recharts data
  const severityChartData = [
    { name: 'Critical', value: metrics.severityCount.Critical, color: '#EF4444' },
    { name: 'High', value: metrics.severityCount.High, color: '#F59E0B' },
    { name: 'Medium', value: metrics.severityCount.Medium, color: '#3B82F6' },
    { name: 'Low', value: metrics.severityCount.Low, color: '#10B981' }
  ].filter(item => item.value > 0);

  const categoryChartData = Object.entries(metrics.categoryCount).map(([key, val]) => ({
    name: key,
    count: val
  }));

  const unverifiedIncidents = incidents.filter(i => !i.verified).slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-500 font-mono">LOADING COGNITIVE INTEL AGENCY DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-150 dark:border-blue-900/10 pb-5">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-5 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-955/30 px-2 font-mono text-[9px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 border border-blue-100/10">
              Autonomous Monitor
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400">
            Real-time municipal risk detection aggregated via cognitive news monitoring, geocoding and duplicate-filtering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl py-2.5 px-4 text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer active:scale-97 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Crawling Feeds...' : 'Refresh Monitor Scan'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/40 rounded-2xl text-xs text-left">
          {error}
        </div>
      )}

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="text-left space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Detected</span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white">{metrics.total}</span>
            <span className="block text-[10px] text-slate-400">Crawled feeds</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Globe className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="text-left space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active/Pending</span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white">{metrics.detected}</span>
            <span className="block text-[10px] text-yellow-600">Pending review</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 animate-pulse">
            <Activity className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="text-left space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Critical Priority</span>
            <span className="block text-2xl font-black text-rose-600 dark:text-rose-500">{metrics.severityCount.Critical}</span>
            <span className="block text-[10px] text-rose-500">Requires escalation</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Flame className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="text-left space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Escalated Reports</span>
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-500">{metrics.verified}</span>
            <span className="block text-[10px] text-emerald-500">Officialized reports</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* Graphical Breakdown Charts */}
      {incidents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category Distribution Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="text-left mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Incident Category Distribution</h3>
              <p className="text-[11px] text-slate-400">Total volume of detected issues broken down by city catalog.</p>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px' }}
                    labelStyle={{ color: '#F1F5F9', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#38BDF8', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="url(#colorCount)" radius={[4, 4, 0, 0]}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity Breakdown Pie Chart */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="text-left mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Risk Severity Ratios</h3>
              <p className="text-[11px] text-slate-400">Proportion of threat indicators.</p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#F1F5F9', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex justify-center gap-4 flex-wrap text-[10px] font-mono font-bold mt-2">
              {severityChartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-500 dark:text-slate-400">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actionable Unverified Alerts Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-left">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Critical Pending AI Detections</h3>
            <p className="text-[11px] text-slate-450">Validate these real-time crawler reports to push them into the master city dashboard.</p>
          </div>
          <button 
            onClick={() => onNavigate('ai-incidents')}
            className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer active:scale-95"
          >
            See All Alerts →
          </button>
        </div>

        {unverifiedIncidents.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-200 dark:border-blue-900/15 rounded-3xl text-center space-y-2 bg-slate-50/20 dark:bg-[#0E1321]/20">
            <Bot className="h-8 w-8 text-slate-350 dark:text-slate-650 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Pending AI Alerts</h4>
            <p className="text-xs text-slate-450 dark:text-slate-500">Your city is currently clear of unverified crawler threats!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unverifiedIncidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onVerify={handleVerify}
                onDismiss={handleDismiss}
                isVerifying={verifyingId === inc.id}
                isDismissing={dismissingId === inc.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
