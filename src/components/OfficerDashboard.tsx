/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, FileText, CheckCircle2, AlertTriangle, TrendingUp, Users, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { Issue, User } from '../types';

interface OfficerDashboardProps {
  user: User;
  issues: Issue[];
  onNavigate: (view: string, issueId?: string) => void;
}

export default function OfficerDashboard({ user, issues, onNavigate }: OfficerDashboardProps) {
  // Filter issues assigned to this specific officer
  const assignedIssues = issues.filter(i => i.assignedOfficerId === user.id);
  const pendingCount = assignedIssues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
  const resolvedCount = assignedIssues.filter(i => i.status === 'Resolved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
      case 'Assigned':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      
      {/* Officer Welcome Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4.5 text-center md:text-left flex-col md:flex-row gap-4">
          <img
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-500/15"
            src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150'}
            alt={user.name}
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Inspector Desk: {user.name}
            </h1>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
              Supervising <span className="font-bold text-slate-700 dark:text-slate-300">Public Works Division</span>. Your site updates sync instantly with citizen alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-350 font-bold text-xs px-5 py-3 transition-colors cursor-pointer"
          >
            Review City Performance
          </button>
        </div>
      </div>

      {/* Officer Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{pendingCount}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Pending Complaints</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{resolvedCount}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Cases Solved</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">4 Teams</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Active Field Crews</p>
          </div>
        </div>
      </div>

      {/* Assigned complaints shelf */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h2 className="font-display font-bold text-lg text-slate-950 dark:text-white">Your Assigned Work Orders</h2>
          </div>
          <span className="rounded-full bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-250/20">
            {assignedIssues.length} assigned
          </span>
        </div>

        {assignedIssues.length === 0 ? (
          <div className="py-20 text-center space-y-3.5 max-w-sm mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-sm text-slate-950 dark:text-white">No active repairs queued</h3>
              <p className="font-sans text-xs text-slate-400 dark:text-slate-500 leading-normal">
                Prstine pipeline! You have completed all work orders currently allocated to your division. Outstanding!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedIssues.map((issue) => (
              <div 
                key={issue.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img src={issue.imageUrl} alt={issue.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-md bg-blue-600/90 text-white font-mono text-[8px] font-bold uppercase tracking-wide px-2 py-0.5">
                        {issue.category}
                      </span>
                      <span className={`rounded-md font-mono text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 ${
                        issue.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                  </div>

                  <div className="p-4.5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-slate-950 dark:text-white text-sm.5">
                        {issue.title}
                      </h3>
                      <p className="font-sans text-[11px] text-slate-400 truncate flex items-center">
                        <MapPin className="h-3 w-3 mr-1 shrink-0" />
                        <span>{issue.location.address}</span>
                      </p>
                    </div>

                    <p className="font-sans text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3">
                      <div className="space-y-0.5">
                        <span className="font-sans text-[9px] text-slate-400">Current Status</span>
                        <div className={`rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </div>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="font-sans text-[9px] text-slate-400 block">Verification Score</span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{issue.verificationScore} XP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4.5 pb-4.5">
                  <button
                    onClick={() => onNavigate('issue-details', issue.id)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 px-4 cursor-pointer"
                  >
                    <span>Open Worksite Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
