/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Medal, Trophy, Users, Search, Flame, MapPin } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  const [wardFilter, setWardFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const wards = ['all', 'Ward 3 - Mission', 'Ward 5 - Heights', 'Ward 2 - Castro'];

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWard = wardFilter === 'all' || entry.ward === wardFilter;
    return matchesSearch && matchesWard;
  });

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Trophy className="h-4 w-4" />
          </div>
        );
      case 2:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-400 text-white shadow-md">
            <Medal className="h-4 w-4" />
          </div>
        );
      case 3:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700 text-white shadow-md">
            <Medal className="h-4 w-4" />
          </div>
        );
      default:
        return <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 w-7 text-center">{rank}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      
      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-slate-200 dark:border-slate-850 pb-6">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/15">
          <Award className="h-5 w-5" />
        </div>
        <h1 className="font-display text-2.5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Civic Hero Leaderboard
        </h1>
        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Celebrate citizens who lead local hazard reporting and verification. Earn XP points and badges as your contributions get resolved!
        </p>
      </div>

      {/* Filter and search headers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search citizen names..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10.5 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 py-2.5 px-4 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="all">Citywide Rank</option>
          <option value="Ward 3 - Mission">Ward 3 - Mission</option>
          <option value="Ward 5 - Heights">Ward 5 - Heights</option>
          <option value="Ward 2 - Castro">Ward 2 - Castro</option>
        </select>
      </div>

      {/* Leaderboard Entries List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 px-6 py-4.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="w-7 text-center">Rank</span>
            <span>Citizen Profile</span>
          </div>
          <div className="flex items-center space-x-12">
            <span className="hidden sm:inline">District / Ward</span>
            <span className="hidden sm:inline">Badges Unlocked</span>
            <span>Civic XP</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-850">
          {filteredEntries.map((entry, idx) => (
            <div 
              key={entry.userId} 
              className="flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all"
            >
              <div className="flex items-center space-x-4">
                {getRankBadge(entry.rank)}
                <div className="flex items-center space-x-3 text-left">
                  <img
                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-100 dark:ring-slate-800"
                    src={entry.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
                    alt={entry.name}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-display font-bold text-xs.5 text-slate-950 dark:text-white">{entry.name}</h3>
                    <span className="font-sans text-[9px] text-slate-400 sm:hidden block leading-normal mt-0.5">
                      {entry.ward}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-12 text-right">
                <span className="hidden sm:inline font-sans text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {entry.ward}
                </span>
                
                <span className="hidden sm:inline font-mono text-xs font-semibold text-slate-700 dark:text-slate-350">
                  {entry.badgesCount} badges
                </span>

                <div className="flex items-center space-x-1 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/10 px-3.5 py-1.5 rounded-full">
                  <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
                  <span>{entry.points} XP</span>
                </div>
              </div>
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
                <Users className="h-6 w-6" />
              </div>
              <p className="font-sans text-xs text-slate-400 dark:text-slate-500">No active citizens located for search filters.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
