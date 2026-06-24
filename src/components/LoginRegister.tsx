/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Mail, Lock, LogIn, Sparkles, User, FileText, Check, UserPlus, MapPin } from 'lucide-react';
import { UserRole } from '../types';

interface LoginRegisterProps {
  onLoginSuccess: (user: any, token?: string) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [ward, setWard] = useState('Ward 3 - Mission');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const sanFranciscoWards = [
    'Ward 3 - Mission',
    'Ward 5 - Heights',
    'Ward 2 - Castro',
    'Ward 4 - Noe',
    'Citywide',
    'City Hall'
  ];

  // 1-Click quick login configurations for hackathon judges
  const demoUsers = [
    {
      role: 'citizen' as UserRole,
      title: 'Alex Mercer (Citizen)',
      email: 'citizen@example.com',
      desc: 'Submit hazards, endorse reports, track progress, earn badges, and climb the city leaderboard.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      color: 'border-blue-500/30 bg-blue-50/10 hover:bg-blue-50/25 dark:bg-blue-950/10 dark:hover:bg-blue-950/20'
    },
    {
      role: 'officer' as UserRole,
      title: 'Marcus Vance (Inspector)',
      email: 'officer@example.com',
      desc: 'Manage assigned complaints, upload repair photos, update statuses, and submit cost evaluations.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
      color: 'border-emerald-500/30 bg-emerald-50/10 hover:bg-emerald-50/25 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20'
    },
    {
      role: 'admin' as UserRole,
      title: 'Sarah Jenkins (Director)',
      email: 'admin@example.com',
      desc: 'Moderate community complaints, allocate budgets, view department velocity, and manage users.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
      color: 'border-purple-500/30 bg-purple-50/10 hover:bg-purple-50/25 dark:bg-purple-950/10 dark:hover:bg-purple-950/20'
    }
  ];

  const handleDemoLogin = async (demoEmail: string, demoRole: UserRole) => {
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, role: demoRole, isDemo: true })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Demo Login successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 500);
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (e) {
      console.error(e);
      setError('Connection to server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please provide an email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (authMode === 'signup' && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMsg('Successfully signed in! Accessing dashboard...');
          setTimeout(() => {
            onLoginSuccess(data.user, data.token);
          }, 800);
        } else {
          setError(data.error || 'Authentication failed. Please verify credentials.');
        }
      } else {
        // Sign Up Mode
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email,
            password,
            role: selectedRole,
            ward
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            onLoginSuccess(data.user, data.token);
          }, 800);
        } else {
          setError(data.error || 'Registration failed. Try a different email.');
        }
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-section" className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300">
      {/* Visual background decorations */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        
        {/* Left Column: Core Portal Credentials */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="font-sans text-xs text-slate-400 dark:text-slate-500">
                {authMode === 'signin' 
                  ? 'Access your authenticated local dashboard with secure JWT clearance.' 
                  : 'Register a secure municipal profile. Password hashes are stored safely.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                }}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 pl-10.5 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 pl-10.5 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 pl-10.5 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400">
                      Local SF Ward
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 pl-10.5 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        {sanFranciscoWards.map((w) => (
                          <option key={w} value={w} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Security Clearance selection */}
                  <div className="space-y-1.5">
                    <label className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Role / Clearance
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['citizen', 'officer', 'admin'] as UserRole[]).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`rounded-lg py-2 text-center font-mono text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                            selectedRole === role
                              ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs py-3 shadow-md shadow-blue-500/10 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  'Verifying Security Seal...'
                ) : authMode === 'signin' ? (
                  <>
                    Sign In Securing JWT
                    <LogIn className="ml-1.5 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Sign Up Secure Account
                    <UserPlus className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-850/60 mt-6 text-center">
            <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
              {authMode === 'signin' ? (
                <>
                  Forgot password? Use default <span className="font-mono text-slate-500 dark:text-slate-300 font-bold">password123</span> for any demo account, or use 1-click evaluation cards on the right.
                </>
              ) : (
                <>
                  Created accounts are persisted securely in-memory. After signing up, you will automatically generate a custom JWT authorization grant.
                </>
              )}
            </span>
          </div>
        </div>

        {/* Right Column: High-Fidelity Quick Login Portal Selection */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <Sparkles className="h-3.5 w-3.5 animate-bounce" />
                <span>One-Click Hackathon Evaluation Panel</span>
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                Quick-Clearance Authorization
              </h3>
              <p className="font-sans text-xs text-slate-400 dark:text-slate-500 leading-normal">
                Quickly toggle roles to view the full application workflow. Selecting any profile automatically triggers a real JWT authorization request and boots up corresponding roles.
              </p>
            </div>

            <div className="space-y-4">
              {demoUsers.map((userConfig) => (
                <div
                  key={userConfig.role}
                  onClick={() => handleDemoLogin(userConfig.email, userConfig.role)}
                  className={`group relative flex items-start space-x-4 border rounded-2xl p-4 transition-all cursor-pointer ${userConfig.color}`}
                >
                  <img
                    className="h-11 w-11 rounded-xl object-cover border border-white/20 dark:border-slate-800 shrink-0"
                    src={userConfig.avatar}
                    alt={userConfig.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {userConfig.title}
                      </h4>
                      <span className="font-mono text-[9px] text-slate-400 font-medium">
                        {userConfig.email}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {userConfig.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-850/60 mt-6 flex items-center space-x-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500">
              <Check className="h-3 w-3" />
            </div>
            <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500">
              Authenticated accounts sync with in-memory JWT session validators.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
