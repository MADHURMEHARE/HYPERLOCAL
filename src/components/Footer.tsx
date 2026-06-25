/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Heart, 
  Github, 
  Twitter, 
  Globe, 
  Mail, 
  MessageSquare,
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  currentUser: any;
}

export default function Footer({ onNavigate, currentUser }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="municipal_footer" className="bg-slate-900 text-slate-300 dark:bg-slate-950 border-t border-slate-800 transition-colors duration-300">
      
      {/* Upper footer grid containing categories and subscription */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              onClick={() => onNavigate('landing')} 
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity w-fit"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-display text-base font-extrabold tracking-tight text-white">
                Community<span className="text-blue-400">Hero</span>
              </span>
            </div>
            
            <p className="font-sans text-xs.5 text-slate-400 leading-relaxed max-w-sm">
              An AI-Powered Hyperlocal Problem Solver enabling citizens to report, track, verify, and resolve community issues in collaboration with local municipal departments.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="#github" 
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="#twitter" 
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter Profile"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#web" 
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                aria-label="Municipal Website"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Civic Services Navigation */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="font-display text-xs.5 font-extrabold uppercase tracking-widest text-slate-400">
              Civic Services
            </h4>
            <ul className="space-y-2 text-xs.5 font-bold font-sans">
              <li>
                <button 
                  onClick={() => onNavigate('map')} 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer block"
                >
                  Explore Heatmap
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('report')} 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer block"
                >
                  AI Photo Shutter
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('leaderboard')} 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer block"
                >
                  Civic Standings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('analytics')} 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer block"
                >
                  Analytics Console
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="font-display text-xs.5 font-extrabold uppercase tracking-widest text-slate-400">
              Resources
            </h4>
            <ul className="space-y-2 text-xs.5 font-bold font-sans">
              <li>
                <button 
                  onClick={() => onNavigate('assistant')} 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer block flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                  AI Assistant Chat
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')} 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer block text-left"
                >
                  About CommunityHero
                </button>
              </li>
              <li>
                <span className="text-slate-500 cursor-default block">
                  Municipal API docs
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default block">
                  Service Level SLAs
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default block">
                  Transparency Reports
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="font-display text-xs.5 font-extrabold uppercase tracking-widest text-slate-400">
              Municipal Dispatch Alerts
            </h4>
            <p className="font-sans text-xs.5 text-slate-400 leading-relaxed">
              Subscribe to get immediate alert logs regarding resolved work orders, severe hazards, and active road maintenance crews in your neighborhood ward.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter neighborhood email"
                  required
                  className="flex-1 rounded-xl bg-slate-800 border border-slate-750 focus:border-blue-500 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-sans"
                />
                <button 
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-blue-500/10 shrink-0"
                >
                  Alert Me
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  ✓ Dispatch subscription live! Check your inbox for confirmation.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Lower footer with copyright and citizen-care badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8">
          <div className="text-left space-y-1">
            <p className="font-sans text-xs text-slate-400">
              © {currentYear} Community Hero Inc. Public Works Transparency & Civic Engagement. All rights reserved.
            </p>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">
              Secure TLS Enforced • Powered by Gemini Vision Models
            </p>
          </div>

          <div className="flex items-center space-x-1.5 self-start sm:self-center bg-slate-850 px-3 py-1.5 rounded-full border border-slate-800">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-sans text-[10px] font-bold text-slate-400">
              Made with care for cleaner cities
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
