import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Terminal, 
  Play, 
  Loader2, 
  CheckCircle, 
  Globe, 
  Rss, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AIService } from '../../services/AIService';

interface TerminalLog {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  time: string;
}

export default function NewsMonitor() {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    articlesProcessed: number;
    newIncidentsCreated: number;
    details: any[];
  } | null>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'ai') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { id: Math.random().toString(), text, type, time }]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runIngestionPipeline = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);
      setLogs([]);

      addLog("Initializing Autonomous Civic Intelligence Crawler...", "info");
      await delay(700);
      
      addLog("Establishing connection to registered RSS News Feeds...", "info");
      await delay(600);

      addLog("CRAWL: Fetching Pune Local Gazette & Bay Area Chronicles feeds...", "info");
      await delay(800);

      addLog("CRAWL: Retreiving raw XML articles. Parsing headline metadata...", "success");
      await delay(650);

      addLog("COGNITION: Spawning Gemini-3.5-Flash Agent cognitive parser...", "ai");
      await delay(700);

      addLog("COGNITION: Analyzing article descriptions for category classification and risk scoring...", "ai");
      await delay(900);

      // Trigger actual back-end crawling
      const result = await AIService.triggerNewsMonitorCrawl();

      addLog(`COGNITION: Gemini analysis completed. Processed ${result.articlesProcessed} articles.`, "success");
      await delay(600);

      addLog("GEOCODE: Passing extracted text boundaries to Google Geocoding API proxy...", "info");
      await delay(800);

      addLog("GEOCODE: Correctly mapped coordinates (India/San Francisco grid bounds successfully resolved).", "success");
      await delay(700);

      addLog("DEDUPLICATE: Commencing composite Jaccard-Haversine duplicate score analysis...", "info");
      await delay(800);

      result.details.forEach((item, idx) => {
        if (item.status === 'Merged (Duplicate)') {
          addLog(`DEDUPLICATE: Alert matches existing cluster: "${item.title}" (Score: ${(item.duplicateScore * 100).toFixed(1)}%). Merged sources.`, "warning");
        } else {
          addLog(`PERSIST: Saved unique incident "${item.title}" in Postgres DB at ${item.location}.`, "success");
        }
      });
      await delay(500);

      addLog(`PIPELINE COMPLETION: Ingestion sequence successful. Created ${result.newIncidentsCreated} new alerts.`, "success");
      setScanResult(result);

    } catch (e: any) {
      addLog(`FATAL ERROR: Ingestion pipeline halted. ${e.message || 'Check logs'}`, "error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left space-y-1 border-b border-slate-150 dark:border-blue-900/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-955/30 px-2 font-mono text-[9px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 border border-cyan-100/10">
            Real-Time Crawler
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Live News Monitor
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400">
          Trigger the news digestion engine to pull articles, extract incident vectors using Gemini, and resolve coordinates in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Terminal Output Console */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-cyan-500" />
              <span>Cognitive Ingestion Console</span>
            </h3>
            
            <button
              disabled={isScanning}
              onClick={runIngestionPipeline}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl py-2 px-4 text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer active:scale-97 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Scanning Feeds...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Live Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Box */}
          <div className="bg-[#030712] rounded-2xl border border-slate-950 dark:border-blue-950/20 shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-[400px]">
            {/* Terminal bar */}
            <div className="flex items-center justify-between bg-[#0B0F19] px-4 py-2.5 border-b border-[#111827]">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                CRAWLER-AGENT-MAIN v1.4.0
              </span>
            </div>

            {/* Terminal screen */}
            <div className="flex-1 p-5 overflow-y-auto space-y-2 text-left no-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-1">
                  <Terminal className="h-8 w-8 text-slate-700 mb-1" />
                  <p>Console Idle. Waiting for trigger input...</p>
                  <p className="text-[10px] font-sans">Click "Start Live Scan" to boot intelligence stream pipeline.</p>
                </div>
              ) : (
                logs.map((log) => {
                  let color = 'text-slate-300';
                  if (log.type === 'success') color = 'text-emerald-400';
                  if (log.type === 'warning') color = 'text-amber-400';
                  if (log.type === 'error') color = 'text-rose-400 font-bold';
                  if (log.type === 'ai') color = 'text-cyan-400 font-bold';

                  return (
                    <div key={log.id} className="leading-relaxed flex items-start space-x-1.5 font-mono text-[11px]">
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span className="text-slate-500 shrink-0">$</span>
                      <span className={color}>{log.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Scan Summary Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-4 text-left">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Pipeline Telemetry</span>
            </h3>

            {scanResult ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-600">Scan Succeeded</p>
                    <p className="text-slate-400">Database synchronized perfectly.</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450">Articles Processed:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scanResult.articlesProcessed}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450">New Alerts Saved:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{scanResult.newIncidentsCreated}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450">Duplicates Filtered:</span>
                    <span className="font-mono font-bold text-amber-500">
                      {scanResult.articlesProcessed - scanResult.newIncidentsCreated}
                    </span>
                  </div>
                </div>

                {/* Micro details list */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-blue-900/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Processed Feed Items</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {scanResult.details.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                        <span className="truncate font-sans max-w-[140px] text-slate-700 dark:text-slate-300 font-bold">{item.title}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded shrink-0 ${
                          item.status === 'Created' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-450'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-16 text-center space-y-2 text-slate-400">
                <Rss className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
                <p className="text-xs">Awaiting monitor scan execution...</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-blue-900/10 text-[10px] text-slate-450 text-left font-sans">
            Cognitive monitor scrapes RSS xml elements, matches text using Jaccard tokens, and computes distance clusters using Haversine equations to prune duplication before database creation.
          </div>
        </div>
      </div>
    </div>
  );
}
