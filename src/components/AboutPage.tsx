/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  MapPin, 
  Brain, 
  Users, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  Heart,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  Briefcase
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
  user: any;
}

export default function AboutPage({ onNavigate, user }: AboutPageProps) {
  const values = [
    {
      title: 'Radical Transparency',
      description: 'Every reported hazard, budget estimate, and repair phase is permanently logged in a public ledger. Citizens can verify the direct application of their public dollars.',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'AI-Empowered Efficiency',
      description: 'Leveraging Gemini multi-modal Vision models to instantly categorize hazards, score severity, and map critical hot zones, bypassing legacy administrative lag.',
      icon: Brain,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Gamified Civil Duty',
      description: 'Stewardship should be rewarding. Active residents earn Civic XP and unique badges, transforming routine community care into an engaging social game.',
      icon: Award,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const team = [
    {
      name: 'Sarah Jenkins',
      role: 'Director of Public Works & Innovation',
      bio: 'Pioneering public transparency for over 12 years. Leading the integration of AI models into metropolitan work coordination systems.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Dr. Elena Rostova',
      role: 'Principal Civic AI Architect',
      bio: 'PhD in Computer Vision. Architect of CommunityHero\'s automated hazard detection pipeline and GIS predictive clustering algorithms.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Marcus Vance',
      role: 'Lead Ward 3 Field Supervisor',
      bio: 'Coordinate on-site crews and verify completed worksite audits. Champion of mobile-first digital work orders.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-[#070A13] transition-colors duration-300 min-h-screen pb-24">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Header Back Link */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-blue-955/40 bg-white/75 dark:bg-[#0f1422]/60 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Hero Header */}
      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
          <Shield className="h-3.5 w-3.5 animate-pulse text-cyan-500" />
          <span>Our Mission & Vision</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          About <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CommunityHero</span>
        </h1>
        <p className="font-sans text-sm sm:text-base text-slate-500 dark:text-slate-450 leading-relaxed max-w-2xl mx-auto">
          We believe that municipal repairs should not be a black box. Our platform links everyday residents, local public works inspectors, and authorized contractor networks under a single real-time civic operating system.
        </p>
      </div>

      {/* Core Platform Mechanics Card */}
      <div className="mx-auto max-w-5xl px-4 mt-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/60 dark:border-blue-955/40 bg-white dark:bg-slate-900/60 p-8 sm:p-10 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6 text-left">
              <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white">
                How We Bridge the Civic Gap
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                Traditional municipal ticket programs are slow, opaque, and hard to follow. Residents submit issues into an administrative void, and vendors work on closed channels. 
              </p>
              <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                <strong>CommunityHero</strong> replaces this with active collaboration. Multi-modal AI immediately maps incident hotspots, local crowds confirm priority levels, and public works inspectors assign clear, tracked budgets to independent vendor guilds.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="font-sans text-xs font-bold">100% Public Work Progress Audit Trails</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="font-sans text-xs font-bold">Gemini AI Photogrammetric Hazard Analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="font-sans text-xs font-bold">Gamified XP system and Citizen Standings</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-5 text-center space-y-2">
                <span className="block text-3xl font-black text-blue-600 dark:text-cyan-400">9.4k+</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved Tickets</span>
              </div>
              <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-5 text-center space-y-2">
                <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-400">32h</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Resolution</span>
              </div>
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 p-5 text-center space-y-2">
                <span className="block text-3xl font-black text-amber-600 dark:text-amber-450">14k+</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Heroes</span>
              </div>
              <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/10 p-5 text-center space-y-2">
                <span className="block text-3xl font-black text-indigo-600 dark:text-indigo-400">96.2%</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidence</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Citizen vs Vendor Detailed User Guide */}
      <div className="mx-auto max-w-5xl px-4 mt-20 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-2xl.5 font-bold text-slate-950 dark:text-white">
            User Roles Explained
          </h2>
          <p className="font-sans text-xs.5 text-slate-500 dark:text-slate-400">
            How different participants coordinate to solve real-world community hazards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Citizen Guide */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/50 dark:border-blue-955/20 bg-white dark:bg-slate-900 p-6 sm:p-8 text-left space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-cyan-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-950 dark:text-white leading-tight">For Citizens</h3>
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono uppercase font-bold tracking-wider">Neighborhood Stewardship</span>
                </div>
              </div>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                As a resident, you represent the eyes and ears of your local ward. Help clean up your city and claim civic standing.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-955 text-[10px] font-bold text-blue-600 dark:text-cyan-400 font-mono mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Capture Infrastructure Fault</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Take a clear picture of potholes, leaks, or debris directly in your neighborhood zone.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-955 text-[10px] font-bold text-blue-600 dark:text-cyan-400 font-mono mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Instant AI Vision Triage</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Our server-side Gemini system scans your evidence, determines the hazard level, and estimates affected residents.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-955 text-[10px] font-bold text-blue-600 dark:text-cyan-400 font-mono mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Upvote & Verify Neighbors</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Vote on reports nearby. Confirm whether public faults have been properly repaired by active crews.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-955 text-[10px] font-bold text-blue-600 dark:text-cyan-400 font-mono mt-0.5">
                    4
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Claim XP & Rewards</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Accumulate XP points on your public citizen profile, level up, and unlock unique achievement badges.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('login')}
              className="w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white py-2.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Get Started as Citizen
            </button>
          </div>

          {/* Vendor Guide */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/50 dark:border-blue-955/20 bg-white dark:bg-slate-900 p-6 sm:p-8 text-left space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 dark:text-emerald-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-950 dark:text-white leading-tight">For Vendors</h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono uppercase font-bold tracking-wider">Independent Repair Guilds</span>
                </div>
              </div>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Licensed local contractors can bidding, manage work queues, update ward supervisors, and submit completion reports.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-955 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Bid on Open Ward Tenders</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Inspect open public infrastructure problems assigned by municipal supervisors. Submit estimates.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-955 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Log Digital Work Orders</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Once assigned, access your complete work-site coordinates and photographic material list digitally.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-955 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Post Live Progress Status</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Provide updates directly from the job site: indicate whether excavation, repair, or clean-up is active.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-955 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    4
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Verify Integrity Score</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1">Complete repairs and upload photogrammetric evidence. Successful audits boost your rating.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('login')}
              className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white py-2.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              Get Started as Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mx-auto max-w-5xl px-4 mt-24 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-2xl.5 font-bold text-slate-950 dark:text-white">
            Core Core Values
          </h2>
          <p className="font-sans text-xs.5 text-slate-500 dark:text-slate-400">
            A secure network prioritizing civic transparency and resource allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val, idx) => (
            <div 
              key={idx}
              className="rounded-2xl border border-slate-200/50 dark:border-blue-955/20 bg-white dark:bg-slate-900 p-6 text-left space-y-4"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${val.color} text-white`}>
                <val.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">
                {val.title}
              </h3>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Meet the Team */}
      <div className="mx-auto max-w-5xl px-4 mt-24 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-2xl.5 font-bold text-slate-950 dark:text-white">
            Meet the Builders
          </h2>
          <p className="font-sans text-xs.5 text-slate-500 dark:text-slate-400">
            The civic planners and AI architects driving modern infrastructure accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div 
              key={idx}
              className="rounded-2xl border border-slate-200/50 dark:border-blue-955/20 bg-white dark:bg-slate-900 p-6 text-left space-y-4"
            >
              <img 
                src={member.avatar} 
                alt={member.name}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-blue-500/10"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">
                  {member.name}
                </h3>
                <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                  {member.role}
                </span>
              </div>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
