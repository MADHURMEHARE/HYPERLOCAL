/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Shield, 
  MapPin, 
  Brain, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Activity, 
  Zap,
  TrendingUp,
  Clock,
  Star,
  Quote,
  BookOpen,
  Sparkles,
  Award
} from 'lucide-react';
import LoginRegister from './LoginRegister';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  user: any;
  onLoginSuccess?: (user: any, token?: string) => void;
}

export default function LandingPage({ onNavigate, user, onLoginSuccess }: LandingPageProps) {
  const stats = [
    { label: 'Active Citizen Heroes', value: '14,820', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Incidents Fully Resolved', value: '9,412', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Avg Resolution Time', value: '32 Hours', icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { label: 'AI Detection Confidence', value: '96.2%', icon: Brain, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' }
  ];

  const features = [
    {
      title: 'AI Multi-Modal Reporting',
      description: 'Upload images or videos of community hazards (potholes, leakages, broken streetlights). Our Gemini Vision model instantly classifies type, severity, and estimates resident impact.',
      icon: Brain,
      badge: 'Advanced AI'
    },
    {
      title: 'Smart Prioritization Engine',
      description: 'Reports are ranked algorithmically using AI analysis severity combined with local traffic density and community endorsement verification scores.',
      icon: Zap,
      badge: 'Algorithmic'
    },
    {
      title: 'Geo-Cluster Heatmapping',
      description: 'Visualize issues in real-time. Toggle predictive hotspots that forecast pavement damage, water pipe leak risks, and municipal failures before they happen.',
      icon: MapPin,
      badge: 'GIS Mapping'
    },
    {
      title: 'Crowdsourced Endorsement',
      description: 'Citizens verify the presence of reported problems on-site, vote on priority, add supplementary evidence, and trace the direct public dollar cost.',
      icon: Users,
      badge: 'Democratic'
    }
  ];

  const testimonials = [
    {
      quote: "CommunityHero completely transformed our neighborhood. I reported a deep pothole on 8th Ave, Gemini identified its critical hazard instantly, and a repair crew filled it in under 24 hours. Pure magic!",
      author: "Clarissa Finch",
      role: "Active Resident, Ward 4",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      rating: 5
    },
    {
      quote: "As a Ward Officer, prioritizing thousands of daily complaints used to be impossible. The automated Gemini severity scoring and live geo-cluster maps let us coordinate repair crews with total efficiency.",
      author: "Marcus Vance",
      role: "Lead City Inspector",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      rating: 5
    },
    {
      quote: "The direct ledger integration and transparency metrics keep us accountable to our citizens. Our municipal resolution times have dropped by 42% since deploying this platform.",
      author: "Sarah Jenkins",
      role: "Director of Public Works",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      rating: 5
    }
  ];

  const blogPosts = [
    {
      title: "How Hyperlocal Civic-Tech is Accelerating City Maintenance",
      excerpt: "Explore the mechanics of crowd-sourced urban reporting and see why smart feedback loops resolve pavement hazards up to 3x faster than legacy hotlines.",
      category: "Urban Planning",
      date: "June 18, 2026",
      readTime: "4 min read",
      author: "Julian Vance",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      image: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Under the Hood: How Gemini Vision Automates Hazard Detection",
      excerpt: "An in-depth look at using multi-modal AI to classify structural damages from street photographs with 96% verification accuracy without manual triage.",
      category: "Civic AI",
      date: "June 12, 2026",
      readTime: "6 min read",
      author: "Dr. Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "The Power of Gamification in Prompting Public Action",
      excerpt: "How reward structures, leaderboards, and citizen experience points are converting casual residents into active local civic heroes across metropolitan areas.",
      category: "Community Engagement",
      date: "June 05, 2026",
      readTime: "5 min read",
      author: "Aisha Patel",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=500&q=80"
    }
  ];

  const handleScrollToLogin = () => {
    const el = document.getElementById('login-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-[#070A13] transition-colors duration-300 min-h-screen pb-16">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 dark:bg-[#0f1422]/60 border border-blue-200/50 dark:border-blue-900/30 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-cyan-400">
              <Activity className="h-3.5 w-3.5 animate-pulse text-blue-500" />
              <span>Next-Gen Civic-Tech Platform</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5.5xl leading-tight">
              Hyperlocal Problem Solving <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(6,182,212,0.15)]">
                Powered by Civic AI
              </span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-slate-500 dark:text-slate-450 leading-relaxed max-w-2xl">
              Become a civic hero. Report local infrastructure problems, upvote neighbors' concerns, and track municipal work orders from assignment to resolution in a 100% transparent dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={user ? () => onNavigate('report') : handleScrollToLogin}
                className="flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-blue-500/25 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                {user ? "Report an Issue Now" : "Sign In to Report Issues"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={user ? () => onNavigate('map') : handleScrollToLogin}
                className="flex items-center justify-center rounded-full border border-slate-200 dark:border-blue-955/40 bg-white/70 dark:bg-[#0f1422]/60 text-slate-700 dark:text-slate-300 font-bold text-sm px-6 py-3.5 backdrop-blur-md transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              >
                View Live Incident Map
              </button>
            </div>
          </div>

          {/* Hero Right Visual (Interactive dashboard frame preview) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  AI Prioritization Model
                </span>
              </div>

              {/* Mock Issue Detail Card */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200/30">
                    Road Damage
                  </span>
                  <span className="font-mono text-[10px] font-bold text-rose-500">
                    Priority: CRITICAL
                  </span>
                </div>
                <h3 className="font-sans font-bold text-slate-950 dark:text-white text-sm">
                  Pothole developing on 14th St intersection
                </h3>
                
                {/* AI Badge inside hero card */}
                <div className="mt-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 p-3 flex items-start space-x-2.5">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-sans text-xs font-bold text-blue-800 dark:text-blue-400">
                      Gemini Technical Classification
                    </h4>
                    <p className="text-[11px] text-blue-750 dark:text-blue-300 leading-normal mt-0.5">
                      Substrate cavitation detected. High impact risk for cycles. Severity: High (94% confidence).
                    </p>
                  </div>
                </div>

                {/* Verification Score Meter */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-850">
                  <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1.5">
                    <span>Citizen Verification Score</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">52/100</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[52%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="mx-auto max-w-7xl px-4 mt-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 p-6 sm:p-8 shadow-md backdrop-blur-xs">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
                <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
              <p className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section (The Mission) */}
      <div className="mx-auto max-w-7xl px-4 mt-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-1.5 text-blue-600 dark:text-cyan-400 font-mono text-xs uppercase font-bold tracking-wider">
              <Shield className="h-4 w-4" />
              <span>About CommunityHero</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl leading-tight">
              A Transparent, High-Speed <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Civic Ledger
              </span>
            </h2>
            <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Founded on the belief that municipal action should be immediate and transparent, CommunityHero connects residents directly with local city inspectors. 
            </p>
            <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              By using next-generation AI image detectors, we bypass bureaucratic bottlenecks. Our public ledger ensures that every pothole filled, water leakage stopped, or streetlight replaced is logged, budgeted, and verified by the community itself.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <h4 className="font-sans font-extrabold text-slate-900 dark:text-white text-sm">Real-Time Dispatch</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">Hazards are prioritized dynamically and allocated to active duty officers in hours, not weeks.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-extrabold text-slate-900 dark:text-white text-sm">Verified Resolution</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">Repairs require photographic proof and resident validation before being archived.</p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80" 
                alt="Infrastructure Repair Crew" 
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-6">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400 font-bold block mb-1">LIVE ACTION</span>
                  <p className="font-display font-bold text-white text-lg">Empowering public works crews with precise telemetry.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works / Core Features Grid */}
      <div className="mx-auto max-w-7xl px-4 mt-24 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Smart Hyperlocal Civic Infrastructure
          </h2>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Four key pillars designed to turn citizens and public works departments into a single coordinated team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="flex flex-col justify-between rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-955/40 text-blue-600 dark:text-cyan-400">
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-slate-50 dark:bg-slate-950 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200/30 dark:border-slate-800/30 uppercase tracking-wide">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">
                  {feat.title}
                </h3>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mx-auto max-w-7xl px-4 mt-28 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Quote className="h-4.5 w-4.5" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            What Our Community Says
          </h2>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Hear from residents, inspectors, and administrators who are building better cities together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((test, idx) => (
            <div 
              key={idx} 
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm backdrop-blur-md text-left transition-all duration-300 hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex space-x-1">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-sans text-xs.5 italic text-slate-600 dark:text-slate-300 leading-relaxed">
                  "{test.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-3.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-850/60">
                <img 
                  src={test.avatar} 
                  alt={test.author} 
                  className="h-9 w-9 rounded-full object-cover border border-white/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-display font-bold text-xs.5 text-slate-950 dark:text-white leading-none">
                    {test.author}
                  </h4>
                  <span className="font-sans text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">
                    {test.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Section */}
      <div className="mx-auto max-w-7xl px-4 mt-28 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            The Civic Intelligence Journal
          </h2>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Latest guidelines, innovation, and educational content on municipal AI development and citizen networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {blogPosts.map((post, idx) => (
            <div 
              key={idx} 
              className="flex flex-col rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <span className="font-mono text-[10px] text-slate-450 dark:text-slate-500">
                    {post.date} • {post.readTime}
                  </span>
                  <h3 className="font-display font-bold text-slate-950 dark:text-white text-sm.5 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center space-x-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-850/60">
                  <img 
                    src={post.avatar} 
                    alt={post.author} 
                    className="h-7 w-7 rounded-full object-cover border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-sans text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    By {post.author}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Municipal & Administrative Showcase */}
      <div className="mx-auto max-w-7xl px-4 mt-28 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-xl border border-indigo-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-80 w-80 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold px-3.5 py-1 tracking-wider uppercase border border-indigo-400/20">
                Municipal Hub
              </span>
              <h2 className="font-display text-2.5xl sm:text-3.5xl font-extrabold tracking-tight">
                Designed for Swift Government Action
              </h2>
              <p className="font-sans text-xs sm:text-sm text-indigo-200/90 leading-relaxed max-w-2xl">
                Are you a Ward Officer, City Inspector, or Municipal Administrator? Community Hero provides specialized dashboards to filter pending complaints, delegate repairs to field crews, outline cost metrics, and release completion photo evidence.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={user ? () => onNavigate(user.role === 'citizen' ? 'citizen-dashboard' : user.role === 'officer' ? 'officer-dashboard' : 'admin-dashboard') : handleScrollToLogin}
                  className="flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-5 py-3 shadow-md transition-all cursor-pointer"
                >
                  Access Inspector Portal
                  <ArrowRight className="ml-1.5 h-4 w-4 text-slate-900" />
                </button>
                <button
                  onClick={user ? () => onNavigate('analytics') : handleScrollToLogin}
                  className="flex items-center justify-center rounded-xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-5 py-3 transition-all cursor-pointer"
                >
                  View Municipal Analytics
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-left">
                <TrendingUp className="h-6 w-6 text-indigo-400 mb-2" />
                <h4 className="font-display font-semibold text-sm">Actionable Analytics</h4>
                <p className="text-[11px] text-indigo-200/70 mt-1">Live incident rates, ward breakdowns, and resolving velocity curves.</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-left">
                <Shield className="h-6 w-6 text-emerald-400 mb-2" />
                <h4 className="font-display font-semibold text-sm">Transparency Metrics</h4>
                <p className="text-[11px] text-indigo-200/70 mt-1">Every cost estimate, municipal note, and officer assignment open to the public.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Section - Only visible when unauthenticated */}
      {!user && onLoginSuccess && (
        <div id="login-section" className="mx-auto max-w-7xl px-4 mt-28 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Join the Civic Movement
            </h2>
            <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Log in to your CommunityHero portal using our simulated quick authorization panel or custom email entry.
            </p>
          </div>
          <LoginRegister onLoginSuccess={onLoginSuccess} />
        </div>
      )}

    </div>
  );
}
