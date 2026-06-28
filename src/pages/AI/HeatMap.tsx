import React, { useState, useEffect } from 'react';
import { RefreshCw, Map, AlertTriangle, HelpCircle } from 'lucide-react';
import { AIService } from '../../services/AIService';
import { AIIncident } from '../../types';
import HeatMapView from '../../components/AI/HeatMapView';

export default function HeatMap() {
  const [incidents, setIncidents] = useState<AIIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AIService.fetchAllIncidents();
        setIncidents(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch incident locations.');
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
        <p className="text-xs text-slate-550 font-mono">LOADING GEOGRAPHIC MAP TILES...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left space-y-1 border-b border-slate-150 dark:border-blue-900/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 items-center justify-center rounded-lg bg-red-50 dark:bg-red-955/30 px-2 font-mono text-[9px] font-extrabold uppercase tracking-widest text-red-600 dark:text-rose-400 border border-red-100/10">
            GIS Thermal Render
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Disaster Heatmap
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400">
          GIS spatial clustering mapping out high-risk zones and infrastructure hot spots crawled by autonomous news monitors.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/40 rounded-2xl text-xs text-left">
          {error}
        </div>
      )}

      {/* Map Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Leaflet Map Stage */}
        <div className="xl:col-span-9">
          <HeatMapView incidents={incidents} />
        </div>

        {/* Map Side panel / Legend */}
        <div className="xl:col-span-3 bg-white dark:bg-[#0E1321] border border-slate-150 dark:border-blue-900/15 p-5 rounded-2xl flex flex-col justify-between shadow-sm text-left space-y-5">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="h-4 w-4 text-blue-500" />
              <span>GIS Layer Legend</span>
            </h3>

            {/* Severity scale indicators */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0 mt-0.5 border border-white dark:border-slate-950 shadow shadow-red-500/50" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Critical Priority Halo</p>
                  <p className="text-[10.5px] text-slate-400 leading-normal">Represents extreme infrastructure failures, heavy floods, building collapse risks, or active disasters.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-0.5 border border-white dark:border-slate-950 shadow shadow-amber-500/50" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">High Risk Region</p>
                  <p className="text-[10.5px] text-slate-400 leading-normal">Large potholes, extensive water main bursts, fire outbreaks, power outages, major road blockages.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0 mt-0.5 border border-white dark:border-slate-950 shadow shadow-blue-500/50" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Medium / Low Halo</p>
                  <p className="text-[10.5px] text-slate-400 leading-normal">Minor pipe leakages, street light failure clusters, localized waste dumps, minor delays.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-blue-900/10 space-y-3">
            <div className="flex items-start gap-1.5 text-[10.5px] text-slate-500">
              <HelpCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-normal">
                Double click or roll mouse wheel on map canvas to zoom. Click on individual Pins to see exact category and source URL attribution details instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
