import React from 'react';
import { motion } from 'motion/react';
import { 
  Rss, 
  ExternalLink, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  Power
} from 'lucide-react';
import { NewsSource } from '../../types';

interface SourceCardProps {
  key?: React.Key;
  source: NewsSource;
  onToggle: (id: string, currentStatus: boolean) => void;
  isUpdating: boolean;
}

export default function SourceCard({ source, onToggle, isUpdating }: SourceCardProps) {
  const formattedFetched = source.lastFetched
    ? new Date(source.lastFetched).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never Crawled';

  return (
    <motion.div 
      layout
      whileHover={{ y: -1 }}
      className={`relative flex items-center justify-between p-4 bg-white dark:bg-[#0E1321] border rounded-2xl shadow-sm transition-colors ${
        source.enabled 
          ? 'border-slate-150 dark:border-blue-900/20' 
          : 'border-slate-100 dark:border-blue-955/10 opacity-60'
      }`}
    >
      <div className="flex items-center space-x-3.5 text-left min-w-0">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
          source.enabled 
            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/10' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
        }`}>
          <Rss className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
              {source.name}
            </h4>
            {source.website && (
              <a 
                href={source.website} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 p-0.5 rounded transition-colors shrink-0"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          
          <p className="font-mono text-[8.5px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {source.rssUrl}
          </p>
          
          <div className="flex items-center gap-1 mt-1 font-sans text-[10px] text-slate-500 dark:text-slate-400">
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
            <span>Last fetched: {formattedFetched}</span>
          </div>
        </div>
      </div>

      <button
        disabled={isUpdating}
        onClick={() => onToggle(source.id, source.enabled)}
        className={`relative inline-flex items-center rounded-full p-1 transition-all cursor-pointer disabled:opacity-50 ${
          source.enabled 
            ? 'text-cyan-500 dark:text-cyan-400 hover:text-cyan-400' 
            : 'text-slate-400 hover:text-slate-500'
        }`}
        title={source.enabled ? 'Disable source' : 'Enable source'}
      >
        {source.enabled ? (
          <ToggleRight className="h-8 w-8" />
        ) : (
          <ToggleLeft className="h-8 w-8" />
        )}
      </button>
    </motion.div>
  );
}
