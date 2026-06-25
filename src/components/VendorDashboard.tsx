/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  Camera, 
  User, 
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Award,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { Issue, User as UserType, IssueStatus } from '../types';

interface VendorDashboardProps {
  user: UserType;
  issues: Issue[];
  onNavigate: (view: string, issueId?: string) => void;
  onUpdateStatus: (issueId: string, payload: {
    status: IssueStatus;
    note: string;
    vendorId?: string;
    vendorName?: string;
    allotmentType?: 'automatic' | 'manual';
    photoUrl?: string;
  }) => Promise<void>;
}

export default function VendorDashboard({ user, issues, onNavigate, onUpdateStatus }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'Assigned' | 'In Progress' | 'Resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Form state
  const [updateStatusVal, setUpdateStatusVal] = useState<IssueStatus>('In Progress');
  const [workNotes, setWorkNotes] = useState('');
  const [repairPhoto, setRepairPhoto] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sample quick completion photos for realistic mock interaction
  const presetPhotos = [
    { label: 'Asphalt Sealing', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600' },
    { label: 'Water Valve Patched', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600' },
    { label: 'Streetlight Re-bulbed', url: 'https://images.unsplash.com/photo-1517420712361-29402d23b7e1?auto=format&fit=crop&w=600' },
    { label: 'Alley Cleaned', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600' }
  ];

  // Filter issues assigned to this vendor
  const vendorIssues = issues.filter(issue => issue.assignedVendorId === user.id);

  // Filter based on tabs & search query
  const filteredIssues = vendorIssues.filter(issue => {
    const matchesTab = activeTab === 'all' || issue.status === activeTab;
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const assignedCount = vendorIssues.filter(i => i.status === 'Assigned').length;
  const inProgressCount = vendorIssues.filter(i => i.status === 'In Progress').length;
  const resolvedCount = vendorIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;

  const handleOpenUpdate = (issue: Issue) => {
    setSelectedIssue(issue);
    setUpdateStatusVal(issue.status === 'Assigned' ? 'In Progress' : 'Resolved');
    setWorkNotes('');
    setRepairPhoto('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    if (!workNotes.trim()) {
      setErrorMsg('Please log descriptive work notes explaining the work accomplished.');
      return;
    }

    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await onUpdateStatus(selectedIssue.id, {
        status: updateStatusVal,
        note: workNotes,
        vendorId: user.id,
        vendorName: user.name,
        allotmentType: selectedIssue.allotmentType || 'automatic',
        photoUrl: repairPhoto || undefined
      });

      setSuccessMsg('Work order updated successfully!');
      // Update local state issue if desired
      setTimeout(() => {
        setSelectedIssue(null);
      }, 1500);
    } catch (err) {
      setErrorMsg('Failed to update work order status on server.');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRepairPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="vendor-dashboard" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      
      {/* Upper Welcomer / Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md backdrop-blur-md mb-8">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img 
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-amber-500/30 shadow-lg"
              src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150'}
              alt={user.name}
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Briefcase className="h-3 w-3 mr-1" />
                <span>MUNICIPAL CONTRACTOR</span>
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {user.name}
              </h1>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
                Authorized City Repair Contractor • Connected to Municipal Works Command
              </p>
            </div>
          </div>

          {/* Badges and performance points card */}
          <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-900 shrink-0">
            <div className="text-center px-4 border-r border-slate-200 dark:border-slate-800">
              <span className="block font-mono text-2xl font-black text-amber-500">{user.points || 0}</span>
              <span className="font-sans text-[10px] text-slate-400 uppercase font-bold tracking-wider">CONTRACTOR XP</span>
            </div>
            <div className="pl-2">
              <span className="block font-sans text-xs font-bold text-slate-600 dark:text-slate-300">Active Badges</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(user.badges || []).map((badge, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-blue-500/10 text-blue-500 uppercase border border-blue-500/10">
                    <Award className="h-2 w-2 mr-0.5 text-amber-500" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">Allotted Causes</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="font-display text-2xl font-black text-slate-950 dark:text-white">{vendorIssues.length}</h3>
            <p className="font-sans text-xs text-slate-500 mt-0.5">Total assignments in system</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Acceptance</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="font-display text-2xl font-black text-slate-950 dark:text-white">{assignedCount}</h3>
            <p className="font-sans text-xs text-slate-500 mt-0.5">Needs work-order initiation</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">In Active Repair</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="font-display text-2xl font-black text-slate-950 dark:text-white">{inProgressCount}</h3>
            <p className="font-sans text-xs text-slate-500 mt-0.5">Crew currently active on site</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Repairs</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="font-display text-2xl font-black text-slate-950 dark:text-white">{resolvedCount}</h3>
            <p className="font-sans text-xs text-slate-500 mt-0.5">Successfully closed work orders</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Columns: Assigned Causes / Work Orders List */}
        <div className="lg:col-span-8 space-y-5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850/60 shadow-sm">
            <h2 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center">
              <FileText className="h-4.5 w-4.5 mr-2 text-amber-500" />
              Assigned Work Orders
            </h2>

            {/* Filters and search box */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 shrink-0">
                {(['all', 'Assigned', 'In Progress', 'Resolved'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer ${
                      activeTab === tab 
                        ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Issue Cards */}
          {filteredIssues.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
              <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">No active work orders</h3>
              <p className="font-sans text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
                No causes are currently allotted matching the status "{activeTab}". When inspectors verify issues or report new incidents, automatic smart mapping will direct repairs your way.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map(issue => (
                <div 
                  key={issue.id}
                  className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
                    <div className="space-y-3">
                      
                      {/* Category and Allotment Type badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase font-mono border border-amber-500/10">
                          {issue.category}
                        </span>

                        {/* Automatic vs Manual allotment badge */}
                        {issue.allotmentType === 'automatic' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase font-mono border border-cyan-500/10">
                            🤖 Automatically Allotted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase font-mono border border-purple-500/10">
                            👷 Manually Allotted
                          </span>
                        )}

                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          issue.status === 'Assigned' 
                            ? 'bg-blue-500/10 text-blue-500' 
                            : issue.status === 'In Progress' 
                              ? 'bg-indigo-500/10 text-indigo-500 animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {issue.status}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                          {issue.title}
                        </h3>
                        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>

                      {/* Location & Meta info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                          {issue.location.address}
                        </span>
                        <span>•</span>
                        <span>Estimated Cost: <strong className="text-slate-600 dark:text-slate-300">${issue.costEstimate || 'TBD'}</strong></span>
                        <span>•</span>
                        <span>Target date: <strong className="text-slate-600 dark:text-slate-300">{issue.resolutionTimeline || 'TBD'}</strong></span>
                      </div>

                    </div>

                    {/* Action buttons on the right */}
                    <div className="flex sm:flex-col items-center justify-end gap-2.5 shrink-0 border-t sm:border-t-0 pt-3.5 sm:pt-0 border-slate-100 dark:border-slate-850">
                      <button
                        onClick={() => handleOpenUpdate(issue)}
                        className="w-full sm:w-32 inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-2 px-3 shadow-xs transition-colors cursor-pointer"
                      >
                        <Activity className="h-3.5 w-3.5 mr-1.5" />
                        Log Progress
                      </button>
                      
                      <button
                        onClick={() => onNavigate('issue-details', issue.id)}
                        className="w-full sm:w-32 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold text-xs py-2 px-3 transition-colors cursor-pointer"
                      >
                        Details
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right 4 Columns: Log Progress Side Panel / Inspector Network */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dynamic Work Order Updater Panel */}
          {selectedIssue ? (
            <div className="rounded-3xl border border-amber-500/25 bg-amber-500/5 p-6 space-y-5 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-sm text-slate-950 dark:text-white flex items-center">
                  <Briefcase className="h-4.5 w-4.5 text-amber-500 mr-2 shrink-0" />
                  Work Order Update
                </h3>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="font-mono text-[10px] font-bold hover:text-rose-500 uppercase cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Target Job</span>
                <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{selectedIssue.title}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedIssue.location.address}</p>
              </div>

              {successMsg && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                
                {/* State selector */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400">
                    Update Progress State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['In Progress', 'Resolved'] as const).map(state => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => setUpdateStatusVal(state)}
                        className={`rounded-lg py-2.5 text-center font-mono text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                          updateStatusVal === state
                            ? 'border-amber-600 bg-amber-500/10 text-amber-600 dark:border-amber-500 dark:text-amber-400'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {state === 'In Progress' ? '⚙️ In Progress' : '✅ Resolved'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technical notes */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400">
                    Field Repair Notes
                  </label>
                  <textarea
                    required
                    value={workNotes}
                    onChange={e => setWorkNotes(e.target.value)}
                    rows={4}
                    placeholder="Provide technical notes. Explain asphalt grade used, pipeline seal compound, replacement LED wattage, safety bar status etc..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 transition-all resize-none"
                  />
                </div>

                {/* Photo uploader */}
                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    Upload Field Proof / Evidence Photo
                  </label>
                  
                  {repairPhoto ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800">
                      <img src={repairPhoto} alt="Repair Evidence" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setRepairPhoto('')}
                        className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] font-bold font-mono text-white hover:bg-rose-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 text-center">
                      <Camera className="h-6 w-6 text-slate-400 mb-1.5" />
                      <span className="text-[10px] font-sans text-slate-400 mb-2">Drag files or click to upload completion logs</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        id="vendor-camera-upload" 
                      />
                      <label 
                        htmlFor="vendor-camera-upload" 
                        className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                      >
                        Select Image
                      </label>
                    </div>
                  )}

                  {/* Preset photo picker helper for rapid evaluator validation */}
                  <div className="space-y-1 pt-1.5">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Preset Evidence Templates:</span>
                    <div className="grid grid-cols-2 gap-1">
                      {presetPhotos.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRepairPhoto(preset.url)}
                          className="text-[9px] text-left px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500 font-mono truncate cursor-pointer"
                        >
                          📸 {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs py-3 shadow-md shadow-amber-500/15 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {updating ? 'Transmitting Field Proof...' : 'Submit Completed Work Order'}
                </button>

              </form>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-center">
              <Activity className="h-10 w-10 text-amber-500/20 mx-auto" />
              <h3 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">Active Dispatch Panel</h3>
              <p className="font-sans text-xs text-slate-400 leading-normal">
                Click "Log Progress" on any assigned work order to open the technical submission drawer. Contractors log evidence, asphalt density levels, and complete tasks here.
              </p>
            </div>
          )}

          {/* Inspector Network / Contacts */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="font-display font-black text-sm text-slate-950 dark:text-white flex items-center">
              <Shield className="h-4.5 w-4.5 text-blue-500 mr-2 shrink-0" />
              Inspector Network
            </h3>
            <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
              These are the city inspectors overseeing your active work allotments. Reach out directly to clarify blueprints or request supplementary road closure permits.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                <div className="flex items-center space-x-2.5">
                  <img 
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150"
                    alt="Inspector Marcus"
                  />
                  <div>
                    <span className="block font-display font-bold text-xs text-slate-900 dark:text-white">Inspector Marcus Vance</span>
                    <span className="block font-mono text-[9px] text-emerald-500">Lead Inspector • Active</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded">
                  Ward 3 & 5
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                <div className="flex items-center space-x-2.5">
                  <img 
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150"
                    alt="Sarah Jenkins"
                  />
                  <div>
                    <span className="block font-display font-bold text-xs text-slate-900 dark:text-white">Sarah Jenkins</span>
                    <span className="block font-mono text-[9px] text-slate-400">Public Works Director</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded">
                  City Hall
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
