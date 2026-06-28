import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  X,
  Bot
} from 'lucide-react';
import { AIService } from '../../services/AIService';
import { AIIncident } from '../../types';
import IncidentCard from '../../components/AI/IncidentCard';

export default function AIIncidentList() {
  const [incidents, setIncidents] = useState<AIIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchVal, setSearchVal] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, Detected (pending), Verified (escalated)

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AIService.fetchAllIncidents();
      setIncidents(data);
    } catch (e: any) {
      setError(e.message || 'Failed to retrieve AI incident lists.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      setVerifyingId(id);
      await AIService.verifyIncident(id);
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

  // Filter Logic
  const filtered = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchVal.toLowerCase()) ||
                          inc.location.toLowerCase().includes(searchVal.toLowerCase()) ||
                          inc.category.toLowerCase().includes(searchVal.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'Detected') {
      matchesStatus = !inc.verified;
    } else if (statusFilter === 'Verified') {
      matchesStatus = inc.verified;
    }

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const categories = Array.from(new Set(incidents.map(i => i.category)));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-550 font-mono">LOADING COGNITIVE ALERTS LIST...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left space-y-1 border-b border-slate-150 dark:border-blue-900/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-955/30 px-2 font-mono text-[9px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 border border-blue-100/10">
            Detections Grid
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          AI Detected Incidents
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400">
          Review, analyze, and manage autonomous incident alerts extracted from news articles.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/40 rounded-2xl text-xs text-left">
          {error}
        </div>
      )}

      {/* Interactive Filtering Row */}
      <div className="bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location, category..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
          />
          {searchVal && (
            <button 
              onClick={() => setSearchVal('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Verification Statuses</option>
            <option value="Detected">Pending Review</option>
            <option value="Verified">Escalated</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          {/* Quick Clear Button */}
          {(severityFilter !== 'all' || statusFilter !== 'all' || searchVal !== '') && (
            <button
              onClick={() => {
                setSeverityFilter('all');
                setStatusFilter('all');
                setSearchVal('');
              }}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Display */}
      {filtered.length === 0 ? (
        <div className="py-24 border-2 border-dashed border-slate-200 dark:border-blue-900/15 rounded-3xl text-center space-y-2 bg-slate-50/20 dark:bg-[#0E1321]/20">
          <Bot className="h-8 w-8 text-slate-350 dark:text-slate-650 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No AI Incidents Match</h4>
          <p className="text-xs text-slate-450 dark:text-slate-500">Try adjusting your filters or triggering a new scan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onVerify={handleVerify}
                onDismiss={handleDismiss}
                isVerifying={verifyingId === inc.id}
                isDismissing={dismissingId === inc.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
