import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, History } from 'lucide-react';
import { AIService } from '../../services/AIService';
import { AIIncident } from '../../types';
import IncidentTimeline from '../../components/AI/IncidentTimeline';

export default function DetectionHistory() {
  const [incidents, setIncidents] = useState<AIIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AIService.fetchAllIncidents();
        setIncidents(data);
      } catch (e: any) {
        setError(e.message || 'Failed to retrieve timeline logs.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-550 font-mono">LOADING COGNITIVE TIMELINE CHRONOLOGY...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left space-y-1 border-b border-slate-150 dark:border-blue-900/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-955/30 px-2 font-mono text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100/10">
            Audit Ledger
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Detection History
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400">
          Chronological audit trail of all AI monitor alerts parsed, classified, geocoded, and escalated over time.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/40 rounded-2xl text-xs text-left">
          {error}
        </div>
      )}

      {/* Timeline display card container */}
      <div className="bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-6 md:p-8 rounded-3xl shadow-sm text-left">
        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-blue-900/10 pb-4">
          <History className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cognitive Detection Stream</h3>
        </div>

        <IncidentTimeline incidents={incidents} />
      </div>
    </div>
  );
}
