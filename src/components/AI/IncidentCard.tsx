import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { AIIncident } from '../../types';
import ConfidenceBadge from './ConfidenceBadge';

interface IncidentCardProps {
  key?: React.Key;
  incident: AIIncident;
  onVerify: (id: string) => void;
  onDismiss: (id: string) => void;
  isVerifying: boolean;
  isDismissing: boolean;
}

export default function IncidentCard({ 
  incident, 
  onVerify, 
  onDismiss, 
  isVerifying, 
  isDismissing 
}: IncidentCardProps) {
  
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="inline-flex items-center rounded-md bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-500">
            Critical Severity
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-500">
            High Severity
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center rounded-md bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-500">
            Medium Severity
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
            Low Severity
          </span>
        );
    }
  };

  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Article Image (Optional) */}
      {incident.imageUrl && (
        <div className="h-44 w-full overflow-hidden relative border-b border-slate-100 dark:border-blue-900/10">
          <img 
            src={incident.imageUrl} 
            alt={incident.title} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3">
            {getSeverityBadge(incident.severity)}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="flex-1 p-5 text-left flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Top meta strip */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!incident.imageUrl && getSeverityBadge(incident.severity)}
            <ConfidenceBadge score={incident.confidence} />
          </div>

          {/* Incident Category & Location */}
          <div className="space-y-1">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              {incident.category}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {incident.title}
            </h3>
          </div>

          {/* Location details */}
          <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-xs bg-slate-50/70 dark:bg-[#12182b] border border-slate-100 dark:border-blue-950/20 p-2.5 rounded-xl">
            <MapPin className="h-3.5 w-3.5 text-blue-500 dark:text-cyan-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-tight font-sans text-[11px]">{incident.location}</span>
          </div>

          {/* Narrative Summary */}
          <p className="text-slate-550 dark:text-slate-350 text-xs leading-relaxed line-clamp-3">
            {incident.description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-blue-900/10 space-y-4">
          
          {/* Source attribution and Date */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 font-sans">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
            
            <a 
              href={incident.sourceUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 font-bold text-blue-600 dark:text-cyan-400 hover:underline active:scale-95"
            >
              <span>{incident.sourceName}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            {incident.verified ? (
              <div className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2 px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Escalated to Official Report</span>
              </div>
            ) : (
              <>
                <button
                  disabled={isVerifying || isDismissing}
                  onClick={() => onVerify(incident.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl py-2 px-3 text-xs font-bold shadow-md shadow-blue-500/10 dark:shadow-cyan-500/5 transition-all cursor-pointer active:scale-97 disabled:opacity-50"
                >
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>{isVerifying ? 'Verifying...' : 'Verify & Escalate'}</span>
                </button>

                <button
                  disabled={isVerifying || isDismissing}
                  onClick={() => onDismiss(incident.id)}
                  className="flex items-center justify-center border border-slate-200 dark:border-blue-950/45 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 rounded-xl p-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Dismiss alert"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
