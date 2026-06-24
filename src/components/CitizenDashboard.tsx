/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Award, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Bell, 
  ChevronRight, 
  ShieldAlert,
  HelpCircle,
  ThumbsUp,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { User, Issue, Notification } from '../types';

interface CitizenDashboardProps {
  user: User;
  issues: Issue[];
  notifications: Notification[];
  onNavigate: (view: string, issueId?: string) => void;
  onClearNotifications: () => void;
}

export default function CitizenDashboard({ 
  user, 
  issues, 
  notifications, 
  onNavigate,
  onClearNotifications
}: CitizenDashboardProps) {
  const userIssues = issues.filter(i => i.createdBy === user.id);
  const resolvedCount = userIssues.filter(i => i.status === 'Resolved').length;
  const inProgressCount = userIssues.filter(i => i.status === 'In Progress').length;

  const badgesList = [
    { name: 'Community Hero', desc: 'Report 3+ issues that get fully resolved by city crews.', icon: Flame, color: 'from-amber-500 to-orange-500' },
    { name: 'Problem Solver', desc: 'Verify 5+ community reports with on-site evidence.', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
    { name: 'Top Reporter', desc: 'Submit an issue that gains 20+ neighborhood upvotes.', icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
    { name: 'Neighborhood Champion', desc: 'Reach 100+ total civic XP on the leaderboard.', icon: Award, color: 'from-purple-500 to-pink-500' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
      case 'Assigned':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
      case 'Verified':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4.5 text-center md:text-left flex-col md:flex-row gap-4">
          <img
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-500/10 dark:ring-blue-500/20"
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
            alt={user.name}
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Welcome Back, {user.name.split(' ')[0]}!
            </h1>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
              Active Member of <span className="font-bold text-slate-750 dark:text-slate-350">{user.ward || 'Ward 3 - Mission'}</span>. Your contributions keep our streets safe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('report')}
            className="flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs px-5 py-3 shadow-md shadow-blue-500/10 transition-all cursor-pointer"
          >
            Report New Hazard
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
            <Award className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{user.points}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Accumulated XP</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center shrink-0">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{userIssues.length}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Reported Issues</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{resolvedCount}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">Fully Resolved</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center shrink-0">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{inProgressCount}</span>
            <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">In Progress</p>
          </div>
        </div>
      </div>

      {/* Middle Layout Grid: Badges Shelves & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Unlocked Badges Shelf */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="font-display font-bold text-lg text-slate-950 dark:text-white">Accolades & Badges Shelf</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badgesList.map((badge, idx) => {
              const isUnlocked = user.badges.includes(badge.name);
              const Icon = badge.icon;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start space-x-3.5 rounded-2xl border p-4 transition-all ${
                    isUnlocked 
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shadow-xs' 
                      : 'border-slate-100 dark:border-slate-900 bg-white opacity-40 dark:bg-slate-900'
                  }`}
                >
                  <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${badge.color} text-white flex items-center justify-center shadow-md shadow-amber-500/5`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-display font-bold text-xs.5 text-slate-950 dark:text-white">{badge.name}</h3>
                      {isUnlocked ? (
                        <span className="rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                          Unlocked
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 text-slate-400 dark:bg-slate-950 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide border border-slate-200/25">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Alerts Panel */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-500" />
                <h2 className="font-display font-bold text-base text-slate-950 dark:text-white">Recent Activity</h2>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={onClearNotifications}
                  className="font-sans text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3.5 max-h-56 overflow-y-auto no-scrollbar">
              {notifications.slice(0, 3).map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => notif.issueId && onNavigate('issue-details', notif.issueId)}
                  className="flex items-start space-x-3 text-left hover:bg-slate-50 dark:hover:bg-slate-850/60 p-2 rounded-xl cursor-pointer transition-colors"
                >
                  <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <div className="space-y-0.5">
                    <h4 className="font-sans text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                      {notif.title}
                    </h4>
                    <p className="font-sans text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-12 text-center">
                  <p className="font-sans text-xs text-slate-400 dark:text-slate-500">No active alerts logged.</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate('map')}
            className="w-full flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl px-4 py-3 font-sans text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer mt-4"
          >
            <span>Explore Citywide Incidents</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* User Reported Issues Shelf */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h2 className="font-display font-bold text-lg text-slate-950 dark:text-white">Your Reported Hazards</h2>
          </div>
          <span className="rounded-full bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-250/20">
            {userIssues.length} total
          </span>
        </div>

        {userIssues.length === 0 ? (
          <div className="py-16 text-center space-y-3.5 max-w-sm mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-sm text-slate-950 dark:text-white">No active hazards filed</h3>
              <p className="font-sans text-xs text-slate-400 dark:text-slate-500 leading-normal">
                You haven't filed any infrastructure reports yet. Use the reporter wizard to instantly analyze and register municipal repair tickets.
              </p>
            </div>
            <button
              onClick={() => onNavigate('report')}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4.5 py-2.5 cursor-pointer shadow-md shadow-blue-500/10"
            >
              Report First Issue
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-3">
                  <th className="py-3 px-2">Hazard / Title</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Severity</th>
                  <th className="py-3 px-2">Endorsements</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {userIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 px-2 max-w-xs sm:max-w-md">
                      <div className="flex items-center space-x-3">
                        <img 
                          className="h-9 w-9 rounded-lg object-cover"
                          src={issue.imageUrl || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=100'} 
                          alt={issue.title}
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 truncate">
                          <h4 className="font-sans font-bold text-slate-900 dark:text-white truncate">
                            {issue.title}
                          </h4>
                          <span className="font-mono text-[9px] text-slate-400 block truncate">
                            {issue.location.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="font-sans font-semibold text-slate-700 dark:text-slate-350">{issue.category}</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`font-semibold ${
                        issue.severity === 'Critical' ? 'text-red-600 dark:text-red-400' :
                        issue.severity === 'High' ? 'text-orange-500 dark:text-orange-400' :
                        issue.severity === 'Medium' ? 'text-amber-500' : 'text-slate-500'
                      }`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex items-center space-x-1 font-mono font-bold text-slate-600 dark:text-slate-400">
                        <ThumbsUp className="h-3.5 w-3.5 text-slate-400" />
                        <span>{issue.upvotes}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => onNavigate('issue-details', issue.id)}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 font-sans text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                      >
                        Track Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
