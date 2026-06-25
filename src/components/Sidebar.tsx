/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Bell, 
  Award, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  User as UserIcon,
  Map,
  PlusCircle,
  LayoutDashboard,
  Trophy,
  BarChart3,
  Bot,
  Briefcase,
  Search
} from 'lucide-react';
import { User, Notification } from '../types';

interface SidebarProps {
  user: User;
  notifications: Notification[];
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onNavigate: (view: string, issueId?: string) => void;
  onLogout: () => void;
  currentView: string;
}

export default function Sidebar({ 
  user, 
  notifications, 
  darkMode, 
  setDarkMode, 
  onNavigate, 
  onLogout,
  currentView
}: SidebarProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle outside clicks to close notifications panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (n: Notification) => {
    setShowNotifications(false);
    setShowMobileSidebar(false);
    n.isRead = true; // Mark as read locally
    if (n.issueId) {
      onNavigate('issue-details', n.issueId);
    } else {
      onNavigate('citizen-dashboard');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
      case 'warning':
      case 'alert':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        );
    }
  };

  const menuItems = [
    { label: 'Explore Map', view: 'map', icon: Map, roles: ['citizen', 'officer', 'admin', 'vendor'] },
    { label: 'Report Issue', view: 'report', icon: PlusCircle, roles: ['citizen'] },
    { label: 'Citizen Portal', view: 'citizen-dashboard', icon: LayoutDashboard, roles: ['citizen'] },
    { label: 'Officer Desk', view: 'officer-dashboard', icon: Shield, roles: ['officer'] },
    { label: 'Vendor Workspace', view: 'vendor-dashboard', icon: Briefcase, roles: ['vendor'] },
    { label: 'Admin Panel', view: 'admin-dashboard', icon: Shield, roles: ['admin'] },
    { label: 'Leaderboard', view: 'leaderboard', icon: Trophy, roles: ['citizen', 'officer', 'admin', 'vendor'] },
    { label: 'Analytics', view: 'analytics', icon: BarChart3, roles: ['citizen', 'officer', 'admin', 'vendor'] },
    { label: 'AI Assistant', view: 'assistant', icon: Bot, roles: ['citizen', 'officer', 'admin', 'vendor'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-[#0B0F19] border-r border-slate-150 dark:border-blue-900/30 p-5">
      <div className="space-y-6">
        {/* Brand Header */}
        <div 
          onClick={() => {
            onNavigate('landing');
            setShowMobileSidebar(false);
          }} 
          className="flex cursor-pointer items-center space-x-3 transition-all duration-200 active:scale-98"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15">
            <Shield className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display text-base font-black tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500 leading-none">
              Community<span className="text-blue-600 dark:text-cyan-400">Hero</span>
            </span>
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-cyan-500/50 mt-1 leading-none">
              Civic AI Network
            </span>
          </div>
        </div>

        {/* User Card Profile details */}
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-[#0f1422]/60 p-3 rounded-2xl border border-slate-150/80 dark:border-blue-955/30">
          <img
            className="h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800"
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
            alt={user.name}
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{user.name}</p>
            <span className="mt-1 inline-flex rounded-md bg-blue-50 dark:bg-blue-955/50 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 border border-blue-100/30 dark:border-cyan-500/10">
              {user.role}
            </span>
          </div>
        </div>

        {/* Gamified Points Badge (Citizen) */}
        {user.role === 'citizen' && (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              onNavigate('leaderboard');
              setShowMobileSidebar(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-2xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/15 p-3 text-left"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Level Progress</span>
                <span className="block text-xs font-extrabold text-slate-800 dark:text-amber-400">{user.points} Civic XP</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">Rank #4</span>
          </motion.div>
        )}

        {/* Navigation Sidebar List */}
        <nav className="space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  onNavigate(item.view);
                  setShowMobileSidebar(false);
                }}
                className={`w-full relative flex items-center space-x-3 rounded-xl px-4 py-2.5 font-sans text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-50/70 border border-blue-200/50 text-blue-600 dark:bg-cyan-950/20 dark:border-cyan-500/25 dark:text-cyan-300 dark:shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <motion.span 
                    layoutId="activeIndicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Utilities */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-blue-900/20">
        
        {/* Alerts & System Status Actions */}
        <div className="flex items-center justify-between gap-2 px-1">
          
          {/* Notifications Trigger */}
          <div className="relative flex-1" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                showNotifications 
                  ? 'border-blue-200 bg-blue-50/50 text-blue-600 dark:border-cyan-500/30 dark:bg-cyan-955/20 dark:text-cyan-400' 
                  : 'border-slate-200 dark:border-blue-950/40 text-slate-600 dark:text-slate-450 bg-slate-50/50 dark:bg-[#0f1422]/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Bell className="h-4 w-4 shrink-0" />
                <span>Alerts</span>
              </span>
              {unreadCount > 0 && (
                <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-11 left-0 z-50 w-72 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-300/50 dark:shadow-black/80"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
                    <span className="font-display font-bold text-[10px] uppercase tracking-wide text-slate-800 dark:text-slate-200">Alert Center</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 font-mono text-[8px] font-extrabold text-blue-600 dark:text-blue-400">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-850 no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center space-y-1.5">
                        <Bell className="mx-auto h-6 w-6 text-slate-350 dark:text-slate-655" />
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-550">No notifications to display.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`flex items-start space-x-2.5 cursor-pointer rounded-xl p-2.5 text-left transition-colors ${
                            notif.isRead 
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-850/50' 
                              : 'bg-blue-50/20 dark:bg-blue-955/5 hover:bg-blue-50/40 dark:hover:bg-blue-955/15'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate ${!notif.isRead ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                              {notif.title}
                            </h4>
                            <p className="mt-0.5 text-[10.5px] text-slate-550 dark:text-slate-400 leading-tight line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 animate-pulse" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl border border-slate-200 dark:border-blue-950/40 p-2 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#0f1422]/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Toggle visual palette"
            title="Toggle theme mode"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Sign Out Trigger Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 rounded-xl border border-rose-500/10 hover:border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-450 dark:hover:bg-rose-955/10 py-2.5 text-xs font-bold transition-all cursor-pointer active:scale-98"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE HEADER BAR (Hidden on desktop) */}
      <div className="lg:hidden flex h-16 w-full items-center justify-between border-b border-slate-150 dark:border-blue-900/40 bg-white dark:bg-[#0B0F19] px-4 shadow-sm shrink-0 z-40 sticky top-0">
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex cursor-pointer items-center space-x-2 transition-all duration-200 active:scale-98"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/15">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <span className="font-display text-sm.5 font-black tracking-tight text-slate-900 dark:text-white">
            Community<span className="text-blue-600 dark:text-cyan-400">Hero</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl border border-slate-200 dark:border-blue-950/40 p-2 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#0f1422]/40"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Hamburger toggle */}
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="rounded-xl border border-slate-200 dark:border-slate-850 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* FIXED SIDEBAR FOR DESKTOP */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </div>

      {/* SLIDING SIDEBAR DRAWER FOR MOBILE */}
      <AnimatePresence>
        {showMobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Drawer Body panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-sm h-full shadow-2xl z-50 flex flex-col"
            >
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="absolute top-4 right-4 z-50 rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 bg-white dark:bg-slate-900 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="h-full">
                {sidebarContent}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
