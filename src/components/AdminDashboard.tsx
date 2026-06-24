/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Users, 
  FolderLock, 
  Activity, 
  Download, 
  Trash2, 
  Check, 
  UserPlus, 
  MapPin, 
  TrendingUp,
  FileDown,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { Issue, User, IssueCategory } from '../types';

interface AdminDashboardProps {
  user: User;
  issues: Issue[];
  usersList: User[];
  onNavigate: (view: string, issueId?: string) => void;
  onModerateIssue: (issueId: string) => void;
  onModifyRole: (userId: string, newRole: any) => void;
}

export default function AdminDashboard({ 
  user, 
  issues, 
  usersList, 
  onNavigate,
  onModerateIssue,
  onModifyRole
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'categories'>('reports');
  const [modalReportData, setModalReportData] = useState<{
    activeTickets: number;
    budget: number;
    transparencyScore: string;
  } | null>(null);

  // Master Categories
  const categoriesList: { name: IssueCategory; desc: string; dept: string }[] = [
    { name: 'Road Damage', desc: 'Potholes, pavement buckling, substrate cracks, and street weathering.', dept: 'Highway & Pavements Unit' },
    { name: 'Water Leakage', desc: 'Burst main pipelines, sewer backflows, and continuous sidewalk seepage.', dept: 'Water & Sewage Utility' },
    { name: 'Garbage Collection', desc: 'Overflowing commercial waste baskets, illegal dumping, and hazardous spillage.', dept: 'Sanitation Division' },
    { name: 'Broken Streetlight', desc: 'Flickering luminaires, structural lamp posts collapses, and pathway darkzones.', dept: 'Electrical Engineering Grid' },
    { name: 'Drainage Issue', desc: 'Storm drain blockage, mud choking, and sidewalk flooding risks.', dept: 'Hydro Maintenance' }
  ];

  const totalCost = issues.reduce((sum, i) => sum + (i.costEstimate || 0), 0);

  const handleSimulateReportGeneration = () => {
    setModalReportData({
      activeTickets: issues.length,
      budget: totalCost,
      transparencyScore: '99.4%'
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      
      {/* Admin header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-5">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase font-bold tracking-wider">
            <FolderLock className="h-4 w-4 animate-pulse" />
            <span>Administrator Control Desk</span>
          </div>
          <h1 className="font-display text-2.5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Supervisory Command Center
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
            Allocate structural municipal budgets, moderate citizen-reported complaints, and modify system access clearances on the fly.
          </p>
        </div>

        <button
          onClick={handleSimulateReportGeneration}
          className="flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <FileDown className="mr-1.5 h-4 w-4" />
          Generate Municipal Audit
        </button>
      </div>

      {/* Admin stats shelf */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center shrink-0">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-xl font-extrabold text-slate-950 dark:text-white">{issues.length}</span>
            <p className="font-sans text-[10px] font-bold text-slate-400 dark:text-slate-500">Total complaints</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-500 flex items-center justify-center shrink-0">
            <Users className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-xl font-extrabold text-slate-950 dark:text-white">{usersList.length}</span>
            <p className="font-sans text-[10px] font-bold text-slate-400 dark:text-slate-500">Registered users</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-xl font-extrabold text-slate-950 dark:text-white">${totalCost.toLocaleString()}</span>
            <p className="font-sans text-[10px] font-bold text-slate-400 dark:text-slate-500">Budget allocated</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
            <Activity className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-mono text-xl font-extrabold text-slate-950 dark:text-white">99.4%</span>
            <p className="font-sans text-[10px] font-bold text-slate-400 dark:text-slate-500">Transparency index</p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-850">
          {(['reports', 'users', 'categories'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-450 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              {tab} Control
            </button>
          ))}
        </div>

        {/* Tab contents */}
        {activeTab === 'reports' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="min-w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3 px-4">
                    <th className="p-4">Ticket</th>
                    <th className="p-4">Ward / Location</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Assigned Officer</th>
                    <th className="p-4">Verification Score</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="p-4 font-sans font-bold text-slate-950 dark:text-white max-w-xs truncate">
                        {issue.title}
                      </td>
                      <td className="p-4 font-sans text-xs">
                        {issue.location.ward || 'Citywide'}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                          issue.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-slate-150 text-slate-700'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="p-4 font-sans text-xs">
                        {issue.assignedOfficerName || 'Unassigned'}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {issue.verificationScore} XP
                      </td>
                      <td className="p-4 text-right flex gap-1.5 justify-end">
                        <button
                          onClick={() => onNavigate('issue-details', issue.id)}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 font-sans text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                        >
                          Moderate Details
                        </button>
                        <button
                          onClick={() => onModerateIssue(issue.id)}
                          className="rounded-lg border border-rose-250 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/25 p-1.5 text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="min-w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3 px-4">
                    <th className="p-4">Citizen Profile</th>
                    <th className="p-4">Security Clearance</th>
                    <th className="p-4">Accumulated XP</th>
                    <th className="p-4">District / Ward</th>
                    <th className="p-4 text-right">Modify Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="p-4 flex items-center space-x-3.5">
                        <img className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-100" src={usr.avatar} alt={usr.name} referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-display font-bold text-slate-950 dark:text-white text-xs">{usr.name}</h4>
                          <span className="font-mono text-[9px] text-slate-400">{usr.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {usr.points} XP
                      </td>
                      <td className="p-4 font-sans text-xs">
                        {usr.ward || 'Citywide'}
                      </td>
                      <td className="p-4 text-right flex gap-1.5 justify-end">
                        {(['citizen', 'officer', 'admin'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => onModifyRole(usr.id, r)}
                            disabled={usr.role === r}
                            className={`rounded-lg py-1 px-2 font-mono text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                              usr.role === r
                                ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-400'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoriesList.map((cat, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-100 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">
                      {cat.name}
                    </span>
                    <span className="font-sans text-[10px] text-slate-400 font-bold">
                      Active
                    </span>
                  </div>
                  <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-850/60 mt-4 flex items-center justify-between">
                  <span className="font-sans text-[10px] text-slate-400">Responsible Dept</span>
                  <span className="font-sans text-[11px] font-bold text-slate-700 dark:text-slate-300">{cat.dept}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Beautiful Modal Overlay for Report Data */}
      {modalReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="space-y-1.5 text-center">
              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Audit Sync Complete</span>
              </span>
              <h3 className="font-display text-xl font-black text-slate-900 dark:text-white">
                Municipal Audit Ledger
              </h3>
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                Relational record analysis successfully exported to the system buffer.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 border-y border-slate-150 dark:border-slate-850 py-1">
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-slate-500 font-medium">Active Tickets Parsed</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{modalReportData.activeTickets} reports</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-slate-500 font-medium">Audited Budget Allocated</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${modalReportData.budget.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-slate-500 font-medium">Transparency Score Index</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{modalReportData.transparencyScore}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-slate-500 font-medium">Archiving Target</span>
                <span className="font-sans font-bold text-slate-700 dark:text-slate-300">Local CSV / PDF Index</span>
              </div>
            </div>

            <button
              onClick={() => setModalReportData(null)}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 shadow-md shadow-blue-500/15 cursor-pointer transition-colors"
            >
              Close Auditor View
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
