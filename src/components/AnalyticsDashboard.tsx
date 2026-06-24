/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Users, 
  BarChart4, 
  LineChart, 
  PieChart, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { Issue } from '../types';

interface AnalyticsDashboardProps {
  issues: Issue[];
}

export default function AnalyticsDashboard({ issues }: AnalyticsDashboardProps) {
  // Counts
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
  const activeIssues = totalIssues - resolvedIssues;
  const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(0) : '0';

  // Category counts
  const categoriesMap: Record<string, number> = {};
  issues.forEach(i => {
    categoriesMap[i.category] = (categoriesMap[i.category] || 0) + 1;
  });

  const barChartData = [
    { label: 'Roads', value: categoriesMap['Road Damage'] || 0, color: 'url(#blueGrad)' },
    { label: 'Water', value: categoriesMap['Water Leakage'] || 0, color: 'url(#emeraldGrad)' },
    { label: 'Garbage', value: categoriesMap['Garbage Collection'] || 0, color: 'url(#amberGrad)' },
    { label: 'Lights', value: categoriesMap['Broken Streetlight'] || 0, color: 'url(#indigoGrad)' },
    { label: 'Drainage', value: categoriesMap['Drainage Issue'] || 0, color: 'url(#roseGrad)' }
  ];

  const maxBarValue = Math.max(...barChartData.map(d => d.value), 1);

  // Status breakdown
  const statusMap: Record<string, number> = {};
  issues.forEach(i => {
    statusMap[i.status] = (statusMap[i.status] || 0) + 1;
  });

  const donutData = [
    { label: 'Reported', value: statusMap['Reported'] || 0, color: '#EF4444' }, // Red
    { label: 'Verified', value: statusMap['Verified'] || 0, color: '#8B5CF6' }, // Purple
    { label: 'In Progress', value: statusMap['In Progress'] || 0, color: '#2563EB' }, // Blue
    { label: 'Resolved', value: statusMap['Resolved'] || 0, color: '#10B981' } // Emerald
  ];

  const totalDonutValue = donutData.reduce((sum, d) => sum + d.value, 0) || 1;

  // Mock Trend Curve
  const trendData = [
    { day: 'Mon', count: 4, resolved: 2 },
    { day: 'Tue', count: 8, resolved: 3 },
    { day: 'Wed', count: 12, resolved: 6 },
    { day: 'Thu', count: 15, resolved: 9 },
    { day: 'Fri', count: 19, resolved: 14 },
    { day: 'Sat', count: 24, resolved: 18 },
    { day: 'Sun', count: totalIssues, resolved: resolvedIssues }
  ];

  const maxTrendVal = 30;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      
      {/* Page Title */}
      <div className="space-y-1 border-b border-slate-200 dark:border-slate-850 pb-5">
        <div className="inline-flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase font-bold tracking-wider">
          <TrendingUp className="h-3.5 w-3.5 animate-pulse" />
          <span>Real-time municipal metrics</span>
        </div>
        <h1 className="font-display text-2.5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Incident Impact Analytics
        </h1>
        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Monitor public works resolution velocity, category-wise distributions, transparent budget allocations, and citizen participation metrics.
        </p>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center shrink-0">
            <BarChart4 className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{totalIssues}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Reported Tickets</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{resolvedIssues}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Resolved Cases</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-500 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{resolutionRate}%</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Resolution Efficiency</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">28 Hours</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Avg Resolution Speed</p>
          </div>
        </div>
      </div>

      {/* Interactive Custom SVG Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown (High-Fidelity SVG Bar Chart) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <BarChart4 className="h-5 w-5 text-blue-500" />
            <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">Category Incident Distributions</h3>
          </div>

          <div className="h-64 w-full relative flex items-end">
            {/* SVG Renderer */}
            <svg className="w-full h-full" viewBox="0 0 500 240">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="40" y1="40" x2="480" y2="40" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="1 4" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="1 4" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="1 4" />
              <line x1="40" y1="200" x2="480" y2="200" stroke="currentColor" className="text-slate-350 dark:text-slate-700" strokeWidth="1" />

              {/* Render Bars */}
              {barChartData.map((d, idx) => {
                const barWidth = 44;
                const spacing = 84;
                const x = 50 + idx * spacing;
                const barHeight = (d.value / maxBarValue) * 140;
                const y = 200 - barHeight;

                return (
                  <g key={idx} className="group cursor-pointer">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 4)}
                      rx="8"
                      fill={d.color}
                      className="transition-all duration-300 group-hover:opacity-90"
                    />
                    {/* Tooltip value */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 10}
                      textAnchor="middle"
                      className="font-mono text-[10px] font-bold fill-slate-900 dark:fill-white"
                    >
                      {d.value}
                    </text>
                    {/* X-axis Label */}
                    <text
                      x={x + barWidth / 2}
                      y={220}
                      textAnchor="middle"
                      className="font-sans text-[10px] font-semibold fill-slate-400 dark:fill-slate-500"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Dynamic Incident Curves (High-Fidelity SVG Line Chart) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <LineChart className="h-5 w-5 text-indigo-500" />
            <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">Resolution Velocity Trajectory</h3>
          </div>

          <div className="h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 240">
              {/* Horizontal grids */}
              <line x1="40" y1="40" x2="480" y2="40" stroke="currentColor" className="text-slate-150 dark:text-slate-850" strokeWidth="1" strokeDasharray="1 5" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="currentColor" className="text-slate-150 dark:text-slate-850" strokeWidth="1" strokeDasharray="1 5" />
              <line x1="40" y1="200" x2="480" y2="200" stroke="currentColor" className="text-slate-350 dark:text-slate-700" strokeWidth="1" />

              {/* Draw reported curve */}
              {(() => {
                const points = trendData.map((d, idx) => {
                  const spacing = 68;
                  const x = 50 + idx * spacing;
                  const y = 200 - (d.count / maxTrendVal) * 150;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <>
                    {/* Shadow Area below curve */}
                    <polygon
                      points={`50,200 ${points} 458,200`}
                      fill="url(#trendArea)"
                      className="opacity-15"
                    />
                    <path
                      d={`M ${trendData.map((d, idx) => {
                        const spacing = 68;
                        const x = 50 + idx * spacing;
                        const y = 200 - (d.count / maxTrendVal) * 150;
                        return `${x} ${y}`;
                      }).join(' L ')}`}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </>
                );
              })()}

              {/* Draw circles for nodes */}
              {trendData.map((d, idx) => {
                const spacing = 68;
                const x = 50 + idx * spacing;
                const y = 200 - (d.count / maxTrendVal) * 150;

                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={220}
                      textAnchor="middle"
                      className="font-sans text-[10px] font-semibold fill-slate-400 dark:fill-slate-500"
                    >
                      {d.day}
                    </text>
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="font-mono text-[9px] font-bold fill-slate-900 dark:fill-white hidden group-hover:block bg-white shadow-xs p-1 rounded"
                    >
                      {d.count}
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>

      {/* Lower Layout row: Status breakdown & Area Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Status Share breakdown (Donut SVG structure) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <PieChart className="h-5 w-5 text-emerald-500" />
            <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">Resolution Status Shares</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-6">
            {/* SVG Donut */}
            <div className="h-36 w-36 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Simulated circle strokes */}
                {(() => {
                  let accumulatedPercent = 0;
                  return donutData.map((d, idx) => {
                    const percent = (d.value / totalDonutValue) * 100;
                    const strokeDasharray = `${percent} ${100 - percent}`;
                    const strokeDashoffset = 100 - accumulatedPercent;
                    accumulatedPercent += percent;

                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="15"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute font-display text-center">
                <span className="font-mono text-xl font-bold text-slate-950 dark:text-white">
                  {totalIssues}
                </span>
                <p className="font-sans text-[9px] text-slate-400 uppercase font-semibold">Active</p>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-2.5">
              {donutData.map((d, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-semibold">
                  <span className="h-3 w-3 rounded-md shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 dark:text-slate-400 font-sans">{d.label}</span>
                  <span className="font-mono text-slate-900 dark:text-white">({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ward performance / Area Heatmap rankings */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">District & Ward Performance</h3>
            <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
              Efficiency Score
            </span>
          </div>

          <div className="space-y-4.5">
            {[
              { name: 'Ward 3 - Mission', issuesCount: 14, resolution: '92%', rating: 'Critical', color: 'bg-emerald-500' },
              { name: 'Ward 5 - Heights', issuesCount: 9, resolution: '88%', rating: 'High', color: 'bg-emerald-500' },
              { name: 'Ward 2 - Castro', issuesCount: 6, resolution: '75%', rating: 'Medium', color: 'bg-amber-500' },
              { name: 'Ward 4 - Noe', issuesCount: 4, resolution: '66%', rating: 'Low', color: 'bg-slate-400' }
            ].map((ward, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-bold text-slate-900 dark:text-white">{ward.name}</span>
                  <div className="flex items-center space-x-3 text-right">
                    <span className="font-sans text-[11px] text-slate-400">{ward.issuesCount} tickets filed</span>
                    <span className="font-mono font-bold text-slate-950 dark:text-white">{ward.resolution} solved</span>
                  </div>
                </div>
                {/* Horizontal meter */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${ward.color}`} style={{ width: ward.resolution }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
