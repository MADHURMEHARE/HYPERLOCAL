import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rss, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  FolderPlus,
  CheckCircle2,
  HelpCircle,
  Globe
} from 'lucide-react';
import { NewsService } from '../../services/NewsService';
import { NewsSource } from '../../types';
import SourceCard from '../../components/AI/SourceCard';

export default function NewsSources() {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [rssUrl, setRssUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadSources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await NewsService.fetchSources();
      setSources(data);
    } catch (e: any) {
      setError(e.message || 'Failed to retrieve news crawler sources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const updated = await NewsService.toggleSource(id, !currentStatus);
      setSources(prev => prev.map(s => s.id === id ? updated : s));
    } catch (e: any) {
      alert(e.message || 'Failed to update source.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rssUrl) {
      setError('Source Name and RSS Feed URL are required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const added = await NewsService.createSource({
        name,
        rssUrl,
        website: website || undefined
      });

      setSources(prev => [...prev, added]);
      setSuccessMsg(`Successfully registered "${name}" RSS stream source.`);
      
      // Reset form
      setName('');
      setRssUrl('');
      setWebsite('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register source.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-550 font-mono">LOADING NEWS SOURCES CONFIGURATION...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-150 dark:border-blue-900/10 pb-5 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-5 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-955/30 px-2 font-mono text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-100/10">
              Ingestion Channels
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            News Sources
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400">
            Configure custom RSS channels, newspapers, and municipal feeds crawled by the AI monitor.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl py-2.5 px-4 text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-97"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Register News Source</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/40 rounded-2xl text-xs text-left">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-955/30 rounded-2xl text-xs text-left flex items-center gap-2 font-bold">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Custom Source form box */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddSource} className="bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl shadow-sm text-left space-y-4 max-w-xl">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-blue-900/10 pb-3">
                <FolderPlus className="h-4.5 w-4.5 text-emerald-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Register Custom RSS Feed</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wide">Source Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune Gazette Weekly"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-slate-5/50 dark:bg-slate-90/50 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wide">RSS Feed XML URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/rss"
                    value={rssUrl}
                    onChange={(e) => setRssUrl(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-slate-5/50 dark:bg-slate-90/50 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wide">Main Website URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-slate-5/50 dark:bg-slate-90/50 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl py-2 px-4 text-xs font-bold shadow shadow-emerald-500/10 cursor-pointer active:scale-97 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Save Channel'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid List of current sources */}
      {sources.length === 0 ? (
        <div className="py-24 border-2 border-dashed border-slate-200 dark:border-blue-900/15 rounded-3xl text-center space-y-2 bg-slate-50/20 dark:bg-[#0E1321]/20">
          <Rss className="h-8 w-8 text-slate-350 dark:text-slate-650 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No News Sources Available</h4>
          <p className="text-xs text-slate-450 dark:text-slate-500">Register your very first RSS stream source above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {sources.map((src) => (
              <SourceCard
                key={src.id}
                source={src}
                onToggle={handleToggle}
                isUpdating={togglingId === src.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
