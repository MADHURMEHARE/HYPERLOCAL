/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  User as UserIcon,
  Map,
  PlusCircle,
  LayoutDashboard,
  Trophy,
  BarChart3,
  Bot,
  Search,
  Briefcase
} from 'lucide-react';
import { User, Notification } from '../types';

interface HeaderProps {
  user: User | null;
  notifications: Notification[];
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onNavigate: (view: string, issueId?: string) => void;
  onLogout: () => void;
  currentView: string;
}

export default function Header({ 
  user, 
  notifications, 
  darkMode, 
  setDarkMode, 
  onNavigate, 
  onLogout,
  currentView
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle outside clicks to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (n: Notification) => {
    setShowNotifications(false);
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
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
        );
      case 'warning':
      case 'alert':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <TrendingUp className="h-4.5 w-4.5" />
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

  const visibleMenuItems = user 
    ? menuItems.filter(item => item.roles.includes(user.role)) 
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-150 dark:border-blue-900/40 bg-white/85 dark:bg-[#0B0F19]/90 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Slogan */}
        <div 
          id="navbar_logo_container"
          onClick={() => onNavigate('landing')} 
          className="flex cursor-pointer items-center space-x-2 sm:space-x-3 transition-all duration-200 active:scale-98 shrink-0"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15">
            <Shield className="h-5 sm:h-5.5 w-5 sm:w-5.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500 leading-none">
              Community<span className="text-blue-600 dark:text-cyan-400">Hero</span>
            </span>
            <span className="hidden sm:block font-mono text-[8.5px] font-bold uppercase tracking-widest text-slate-400 dark:text-cyan-500/50 mt-1 leading-none">
              Civic AI Network
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                id={`nav_link_${item.view}`}
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`relative flex items-center space-x-1.5 rounded-full px-4 py-1.5 font-sans text-[11.5px] font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50/70 border border-blue-200/80 text-blue-600 dark:bg-cyan-950/20 dark:border-cyan-500/25 dark:text-cyan-300 dark:shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls Side (Search, XP, Alerts, Profile, Theme) */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          
          {/* Glass Search Input */}
          {user && (
            <div className="hidden md:block relative max-w-xs w-44 lg:w-52 transition-all duration-300 focus-within:w-60">
              <input
                type="text"
                placeholder="Search ledgers..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full rounded-full bg-slate-100/50 dark:bg-[#0f1422]/60 border border-slate-200 dark:border-blue-955/50 pl-4 pr-10 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </div>
          )}

          {/* XP Gamification Chip */}
          {user && user.role === 'citizen' && (
            <div 
              id="navbar_xp_chip"
              onClick={() => onNavigate('leaderboard')}
              className="hidden md:flex cursor-pointer items-center space-x-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 px-3 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-400 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all active:scale-95 shrink-0"
              title="Click to view full community leaderboards"
            >
              <Award className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span className="font-mono tracking-tight">{user.points} XP</span>
            </div>
          )}

          {/* Theme Switcher Button */}
          <button
            id="navbar_theme_toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full border border-slate-200 dark:border-blue-950/40 p-2 text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-[#0f1422]/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-850 dark:hover:text-white transition-all duration-200 cursor-pointer active:scale-95 shrink-0 shadow-inner"
            aria-label="Toggle visual palette"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Trigger & Dropdown */}
          {user && (
            <div className="relative" ref={notificationsRef}>
              <button
                id="navbar_notifications_trigger"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                className={`relative rounded-full border p-2 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 shadow-inner ${
                  showNotifications 
                    ? 'border-blue-200 bg-blue-50/50 text-blue-600 dark:border-cyan-500/30 dark:bg-cyan-955/20 dark:text-cyan-400' 
                    : 'border-slate-200 dark:border-blue-950/40 text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-[#0f1422]/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Enhanced Notifications Dropdown Menu (Responsive positioning) */}
              {showNotifications && (
                <div 
                  id="navbar_notifications_dropdown"
                  className="fixed sm:absolute top-16 sm:top-auto right-4 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-200/60 dark:shadow-black/70 ring-1 ring-black/5 overflow-hidden transform origin-top-right transition-all z-50"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
                    <span className="font-display font-extrabold text-xs.5 uppercase tracking-wide text-slate-900 dark:text-white">Live Updates</span>
                    {unreadCount > 0 ? (
                      <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 font-mono text-[9.5px] font-extrabold text-blue-600 dark:text-blue-400">
                        {unreadCount} New Alert{unreadCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Up to date</span>
                    )}
                  </div>

                  <div className="max-h-[320px] overflow-y-auto no-scrollbar py-1 divide-y divide-slate-100 dark:divide-slate-850">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <Bell className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p className="text-xs text-slate-400 dark:text-slate-500">All notifications handled. Standby for dispatch.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`flex items-start space-x-3.5 cursor-pointer rounded-xl p-3.5 transition-colors ${
                            notif.isRead 
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-850/60' 
                              : 'bg-blue-50/30 dark:bg-blue-955/10 hover:bg-blue-50/55 dark:hover:bg-blue-955/20'
                          }`}
                        >
                          <div className="shrink-0">
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className={`text-xs font-bold text-slate-900 dark:text-white ${!notif.isRead ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                              {notif.title}
                            </h4>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                              {notif.message}
                            </p>
                            <span className="mt-1.5 block font-mono text-[9px] text-slate-400">
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!notif.isRead && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500 animate-pulse" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Dropdown */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                id="navbar_profile_dropdown_trigger"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-850 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer active:scale-95"
              >
                <img
                  className="h-7 w-7 rounded-lg object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
                <ChevronDown className="hidden sm:block h-4 w-4 text-slate-400" />
              </button>

              {/* Profile drop list */}
              {showUserDropdown && (
                <div 
                  id="navbar_profile_dropdown"
                  className="absolute right-0 mt-3 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl ring-1 ring-black/5 overflow-hidden"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20 rounded-xl">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                    <span className="mt-2 inline-flex rounded-lg bg-blue-50 dark:bg-blue-955 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                      🛡️ {user.role} role
                    </span>
                  </div>

                  <div className="py-1.5 space-y-0.5 text-left">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate(
                          user.role === 'citizen' 
                            ? 'citizen-dashboard' 
                            : user.role === 'officer' 
                              ? 'officer-dashboard' 
                              : user.role === 'vendor' 
                                ? 'vendor-dashboard' 
                                : 'admin-dashboard'
                        );
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850/60 cursor-pointer"
                    >
                      Dashboard Command Center
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('leaderboard');
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850/60 cursor-pointer"
                    >
                      Community Leaderboard
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('report');
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850/60 cursor-pointer"
                    >
                      AI Photo Reporter
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-extrabold text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/20 cursor-pointer border-t border-slate-100 dark:border-slate-850 mt-1.5"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="navbar_signin_button"
              onClick={() => onNavigate('login')}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4.5 py-2.5 font-sans text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all cursor-pointer active:scale-95"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hambuger Toggle */}
          <button
            id="navbar_mobile_menu_trigger"
            onClick={() => {
              setShowMobileMenu(!showMobileMenu);
              setShowNotifications(false);
              setShowUserDropdown(false);
            }}
            className="flex lg:hidden rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer active:scale-95"
            aria-label="Toggle navigation drawer"
          >
            {showMobileMenu ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>

        </div>
      </div>

      {/* Enhanced Mobile Navigation Panel with touch-friendly layouts */}
      {showMobileMenu && (
        <div 
          id="navbar_mobile_drawer"
          className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300 py-4 px-4 shadow-2xl"
        >
          {user && (
            <div className="mb-4 flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
              <img
                className="h-10 w-10 rounded-xl object-cover"
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
                alt={user.name}
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs.5 font-extrabold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                <span className="inline-flex mt-1 rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  {user.role}
                </span>
              </div>
              {user.role === 'citizen' && (
                <div className="bg-amber-500/15 border border-amber-500/20 rounded-xl px-2.5 py-1 text-center font-mono">
                  <span className="block text-[8px] font-bold text-amber-600 uppercase">Points</span>
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">{user.points} XP</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  id={`mobile_nav_${item.view}`}
                  key={item.view}
                  onClick={() => {
                    setShowMobileMenu(false);
                    onNavigate(item.view);
                  }}
                  className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-955/30 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/60'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {user ? (
              <button
                id="mobile_nav_signout"
                onClick={() => {
                  setShowMobileMenu(false);
                  onLogout();
                }}
                className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-t border-slate-100 dark:border-slate-850 mt-2 pt-3"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out Account</span>
              </button>
            ) : (
              <button
                id="mobile_nav_signin"
                onClick={() => {
                  setShowMobileMenu(false);
                  onNavigate('login');
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-blue-600 py-3 text-center text-xs font-extrabold text-white shadow-lg shadow-blue-500/10 mt-2"
              >
                <span>Sign In Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
