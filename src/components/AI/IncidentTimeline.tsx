import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  MapPin, 
  Bot, 
  Clock, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { AIIncident } from '../../types';

interface IncidentTimelineProps {
  incidents: AIIncident[];
}

export default function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  const sorted = [...incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-200 dark:border-blue-900/15 rounded-2xl bg-slate-50/50 dark:bg-[#0c101d]/50">
        <Clock className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Detection History</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Run a news monitor scan to process alerts.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-150 dark:border-blue-900/30 pl-6 ml-4 space-y-8">
      {sorted.map((item, index) => {
        const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const isVerified = item.verified;

        return (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="relative"
          >
            {/* Timeline node icon anchor */}
            <span className={`absolute -left-10 top-0 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-[#0B0F19] ${
              isVerified 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            }`}>
              {isVerified ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </span>

            {/* Time badge and title */}
            <div className="flex flex-col gap-1 text-left">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-cyan-500/60 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedDate}
              </span>
              
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  {item.title}
                </h4>
                {isVerified && (
                  <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-600 border border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/15 dark:text-emerald-400">
                    Escalated
                  </span>
                )}
              </div>

              {/* Snippet box */}
              <div className="mt-2.5 max-w-2xl bg-slate-50/70 dark:bg-[#0E1321] border border-slate-150 dark:border-blue-955/20 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                <p className="leading-relaxed">{item.description}</p>
                
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-blue-900/10 pt-2 text-[10.5px]">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-sans">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 dark:text-cyan-400 shrink-0" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-blue-600 dark:text-cyan-400">{item.category}</span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-slate-400 dark:text-slate-500">Source: <b className="text-slate-500 dark:text-slate-400">{item.sourceName}</b></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
