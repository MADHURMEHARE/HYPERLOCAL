/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Shield, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  User as UserIcon,
  Check,
  Send,
  Camera
} from 'lucide-react';
import { User, Issue, Comment } from '../types';

interface IssueDetailsProps {
  user: User;
  issueId: string;
  issues: Issue[];
  comments: Comment[];
  onBack: () => void;
  onVote: (id: string) => void;
  onVerify: (id: string) => void;
  onAddComment: (issueId: string, content: string, photo?: string) => void;
  onUpdateStatus: (issueId: string, payload: any) => void;
}

export default function IssueDetails({ 
  user, 
  issueId, 
  issues, 
  comments, 
  onBack,
  onVote,
  onVerify,
  onAddComment,
  onUpdateStatus
}: IssueDetailsProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentPhoto, setCommentPhoto] = useState('');
  
  // Officer Console States
  const [officerStatus, setOfficerStatus] = useState('');
  const [officerNote, setOfficerNote] = useState('');
  const [officerCost, setOfficerCost] = useState('');
  const [officerTimeline, setOfficerTimeline] = useState('');
  const [progressPhoto, setProgressPhoto] = useState('');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const issue = issues.find(i => i.id === issueId);
  if (!issue) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold dark:text-white">Issue Not Found</h2>
        <button onClick={onBack} className="text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const issueComments = comments.filter(c => c.issueId === issue.id);
  const isCreator = issue.createdBy === user.id;
  const hasVerified = issue.verifiedBy.includes(user.id);

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-amber-500 text-slate-900';
      default: return 'bg-slate-500 text-white';
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText) return;
    onAddComment(issue.id, newCommentText, commentPhoto);
    setNewCommentText('');
    setCommentPhoto('');
  };

  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};
    if (officerStatus) payload.status = officerStatus;
    if (officerNote) payload.note = officerNote;
    if (officerCost) payload.costEstimate = Number(officerCost);
    if (officerTimeline) payload.resolutionTimeline = officerTimeline;
    if (progressPhoto) payload.photoUrl = progressPhoto;
    
    payload.officerId = user.id;
    payload.officerName = user.name;

    onUpdateStatus(issue.id, payload);
    setOfficerNote('');
    setProgressPhoto('');
    showToast('Municipal status log updated successfully! Relational timeline synchronizing.', 'success');
  };

  const handleSimulateVerify = () => {
    if (hasVerified) {
      showToast('You have already submitted an on-site verification signature for this incident.', 'warning');
      return;
    }
    onVerify(issue.id);
    showToast('On-site verification submitted successfully! (+15 XP earned)', 'success');
  };

  // Status timeline nodes
  const statuses = ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const currentStatusIdx = statuses.indexOf(issue.status);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen relative">
      
      {/* Toast Notification overlay */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start space-x-3">
            {notification.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
            {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />}
            {notification.type === 'info' && <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {notification.type === 'success' ? 'Operation Successful' : notification.type === 'warning' ? 'Warning Alert' : 'System Notification'}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </button>

        <span className="font-mono text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
          Ticket ID: {issue.id}
        </span>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Detail Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            
            {/* Visual Header Image */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
              <img 
                className="h-full w-full object-cover" 
                src={issue.imageUrl || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800'} 
                alt={issue.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Category, Status badge row over image */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between flex-wrap gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-md bg-blue-600/95 text-white font-mono text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 border border-blue-500">
                      {issue.category}
                    </span>
                    <span className={`rounded-md font-mono text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 border ${getPriorityColor(issue.priority)}`}>
                      {issue.priority} Priority
                    </span>
                  </div>
                  <h1 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    {issue.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="font-display font-bold text-slate-950 dark:text-white text-sm.5">
                  Visual Incident Description
                </h3>
                <p className="font-sans text-xs.5 text-slate-600 dark:text-slate-350 leading-relaxed">
                  {issue.description}
                </p>
              </div>

              {/* Geo Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-sans text-[10px] text-slate-400">Street Pin Address</span>
                    <p className="font-sans text-xs font-semibold text-slate-950 dark:text-white">{issue.location.address}</p>
                    <span className="font-sans text-[9px] text-slate-400 block">{issue.location.ward}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-sans text-[10px] text-slate-400">Date Logged</span>
                    <p className="font-sans text-xs font-semibold text-slate-950 dark:text-white">
                      {new Date(issue.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <span className="font-sans text-[9px] text-slate-400 block">
                      Submitted by {issue.creatorName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Core Lifecycle timeline */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="font-display font-bold text-base text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">
              Resolution Progress Tracking
            </h2>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative">
              {statuses.map((status, idx) => {
                const isActive = idx <= currentStatusIdx;
                const isCurrent = idx === currentStatusIdx;
                return (
                  <div key={status} className="flex flex-col items-center text-center space-y-2 relative">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-all ${
                      isCurrent 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/10 scale-110' 
                        : isActive 
                        ? 'border-emerald-500 bg-emerald-500 text-white' 
                        : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950'
                    }`}>
                      {isActive && !isCurrent ? <Check className="h-4.5 w-4.5" /> : idx + 1}
                    </div>
                    <div>
                      <span className={`font-sans text-[10px] font-bold block ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historical Status Timeline Log */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-4">
              <h3 className="font-display font-semibold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Progress Event History
              </h3>

              <div className="space-y-4">
                {issue.progressUpdates.map((update, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5 border-l-2 border-slate-200 dark:border-slate-800 pl-4 relative">
                    <span className="absolute -left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 border border-white dark:border-slate-900" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 px-2 py-0.5 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                          {update.status}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">
                          {new Date(update.updatedAt).toLocaleDateString()} {new Date(update.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-slate-600 dark:text-slate-400 leading-normal">
                        {update.note}
                      </p>
                      <span className="font-sans text-[10px] text-slate-400 block font-medium">
                        Log signed by: {update.updatedBy}
                      </span>
                      
                      {update.photoUrl && (
                        <div className="mt-2.5 max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                          <img src={update.photoUrl} alt="Progress on site" className="h-32 w-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Public transparent comments thread */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h2 className="font-display font-bold text-base text-slate-950 dark:text-white">Transparent Discussions</h2>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                {issueComments.length} Responses
              </span>
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
              {issueComments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3.5 border-b border-slate-100 dark:border-slate-850/40 pb-4 last:border-b-0 last:pb-0">
                  <img
                    className="h-8.5 w-8.5 rounded-xl object-cover shrink-0 ring-1 ring-slate-100"
                    src={comment.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
                    alt={comment.userName}
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-xs text-slate-950 dark:text-white">
                        {comment.userName}
                      </h4>
                      <span className="font-mono text-[9px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {comment.content}
                    </p>

                    {comment.evidencePhoto && (
                      <div className="mt-2 max-w-sm rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <img src={comment.evidencePhoto} alt="Supplementary evidence" className="h-28 w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {issueComments.length === 0 && (
                <div className="py-8 text-center">
                  <p className="font-sans text-xs text-slate-400 dark:text-slate-500">No public statements posted. Be the first to share details!</p>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-850">
              <div className="space-y-1">
                <label className="font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Post Public Context or Photo Evidence
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Provide neighborhood impact details or update notes..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-3 pl-4 pr-11 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 hover:bg-blue-700 p-2 text-white transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Simulation Photo Evidence attachment for commenting */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const presetUrls = [
                      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400',
                      'https://images.unsplash.com/photo-1517420712361-29402d23b7e1?auto=format&fit=crop&w=400'
                    ];
                    setCommentPhoto(presetUrls[Math.floor(Math.random() * presetUrls.length)]);
                  }}
                  className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-250 dark:border-slate-850 px-3 py-1.5 font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Attach On-Site Proof photo</span>
                </button>
                {commentPhoto && (
                  <span className="font-mono text-[9px] text-emerald-500 font-semibold uppercase">
                    Photo Linked!
                  </span>
                )}
              </div>
            </form>
          </div>

        </div>

        {/* Right Hand: Verification Score & Municipal Allocation */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Crowdsourced Verification Score Calculator */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase font-bold tracking-wider">
              <Shield className="h-4 w-4" />
              <span>Prioritization score</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display font-extrabold text-2.5xl text-slate-950 dark:text-white">
                  {issue.verificationScore} XP
                </h3>
                <span className="font-sans text-[11px] text-slate-400 font-semibold">Priority Score</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                  style={{ width: `${Math.min(issue.verificationScore, 100)}%` }}
                />
              </div>
            </div>

            {/* Formula display */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-100 dark:border-slate-900 space-y-2">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block tracking-wide">
                Prioritization Score Formula
              </span>
              <p className="font-mono text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                Score = <span className="text-slate-950 dark:text-white font-bold">{issue.upvotes}</span> Upvotes + <span className="text-slate-950 dark:text-white font-bold">{issue.verifiedBy.length * 5}</span> Verifications (5XP ea) + <span className="text-slate-950 dark:text-white font-bold">{Math.round(issue.aiConfidence / 10)}</span> AI Confidence
              </p>
            </div>

            {/* Endorsement Actions */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <button
                onClick={() => onVote(issue.id)}
                className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 shadow-xs transition-colors cursor-pointer"
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" />
                Upvote ({issue.upvotes})
              </button>
              
              <button
                onClick={handleSimulateVerify}
                disabled={hasVerified}
                className={`flex items-center justify-center rounded-xl font-bold text-xs py-2.5 shadow-xs transition-all cursor-pointer ${
                  hasVerified 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                {hasVerified ? 'Verified!' : 'Verify Existence'}
              </button>
            </div>
          </div>

          {/* Transparent Allocation Metrics (Budget, Target, Officer) */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">
              Transparent Municipal Allocation
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between font-sans text-xs">
                <span className="text-slate-400">Assigned Officer</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                  <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{issue.assignedOfficerName || 'Awaiting dispatch'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between font-sans text-xs border-t border-slate-100 dark:border-slate-850 pt-2.5">
                <span className="text-slate-400">Audited Resolution Cost</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  <span>{issue.costEstimate ? `${issue.costEstimate.toLocaleString()} USD` : 'Calculating...'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between font-sans text-xs border-t border-slate-100 dark:border-slate-850 pt-2.5">
                <span className="text-slate-400">Scheduled Target Date</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{issue.resolutionTimeline ? issue.resolutionTimeline : 'Awaiting evaluation'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Municipal Officer Command console */}
          {(user.role === 'officer' || user.role === 'admin') && (
            <div className="rounded-3xl border border-blue-200 bg-blue-50/20 dark:border-blue-900 dark:bg-blue-950/10 p-6 shadow-md space-y-4">
              <div className="flex items-center space-x-2 border-b border-blue-100 dark:border-blue-900/40 pb-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-display font-extrabold text-sm text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                  Service Update Console
                </h3>
              </div>

              <form onSubmit={handleOfficerSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Advance Ticket Status
                  </label>
                  <select
                    value={officerStatus}
                    onChange={(e) => setOfficerStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">-- Maintain status --</option>
                    <option value="Reported">Reported</option>
                    <option value="Verified">Verified</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Audited Public Budget Cost ($)
                  </label>
                  <input
                    type="number"
                    value={officerCost}
                    onChange={(e) => setOfficerCost(e.target.value)}
                    placeholder="e.g. 850"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Completion Target Schedule
                  </label>
                  <input
                    type="date"
                    value={officerTimeline}
                    onChange={(e) => setOfficerTimeline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Municipal Work Note / Memo
                  </label>
                  <textarea
                    rows={3}
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    placeholder="Write detailed actions, materials applied, and lane closures."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Simulated work site camera capture */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Upload Work Evidence photo
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setProgressPhoto('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400');
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-900 bg-white dark:bg-slate-950 py-2.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{progressPhoto ? 'Photo Attached!' : 'Dispatch Site Photo Capture'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Commit Action Update Log
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
