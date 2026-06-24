/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import LoginRegister from './components/LoginRegister';
import CitizenDashboard from './components/CitizenDashboard';
import ReportIssue from './components/ReportIssue';
import IssueDetails from './components/IssueDetails';
import InteractiveMap from './components/InteractiveMap';
import Leaderboard from './components/Leaderboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AiAssistant from './components/AiAssistant';
import { Shield } from 'lucide-react';
import { User, Issue, Comment, PredictiveHotspot, LeaderboardEntry, Notification as AppNotification } from './types';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [prefilledLocation, setPrefilledLocation] = useState<{ lat: number; lng: number; address?: string; ward?: string } | null>(null);

  // Global State Modules
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [predictions, setPredictions] = useState<PredictiveHotspot[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Toggle Theme Class on Document Element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load Initial Data from Full-Stack Express Server or Fallbacks
  useEffect(() => {
    const fetchData = async () => {
      let activeUser: User | null = null;
      const storedToken = localStorage.getItem('hero_token');

      if (storedToken) {
        try {
          const verifyRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              activeUser = verifyData.user;
              setCurrentUser(verifyData.user);
            }
          } else {
            localStorage.removeItem('hero_token');
          }
        } catch (e) {
          console.warn("Express JWT verification failed, continuing in guest mode.", e);
        }
      }

      try {
        const headers: Record<string, string> = {};
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const [issuesRes, commentsRes, predictionsRes, usersRes, leaderRes, notifyRes] = await Promise.all([
          fetch('/api/issues', { headers }),
          fetch('/api/comments', { headers }),
          fetch('/api/predictions', { headers }),
          fetch('/api/users', { headers }),
          fetch('/api/leaderboard', { headers }),
          fetch(activeUser ? `/api/notifications/${activeUser.id}` : '/api/notifications', { headers })
        ]);

        if (issuesRes.ok) setIssues(await issuesRes.json());
        if (commentsRes.ok) setComments(await commentsRes.json());
        if (predictionsRes.ok) setPredictions(await predictionsRes.json());
        if (usersRes.ok) setUsersList(await usersRes.json());
        if (leaderRes.ok) setLeaderboard(await leaderRes.json());
        if (notifyRes.ok) setNotifications(await notifyRes.json());
      } catch (err) {
        console.warn("Express endpoint connections unavailable. Bootstrapping client state.", err);
      }
    };
    fetchData();
  }, []);

  // Set default view on user authentication change
  useEffect(() => {
    if (!currentUser) {
      setCurrentView('landing');
      return;
    }

    if (currentUser.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else if (currentUser.role === 'officer') {
      setCurrentView('officer-dashboard');
    } else {
      setCurrentView('citizen-dashboard');
    }
  }, [currentUser]);

  // Dynamic Handlers
  const handleLogin = (user: User, token?: string) => {
    if (token) {
      localStorage.setItem('hero_token', token);
    }
    setCurrentUser(user);
    
    // Add logging notification
    const newNotify: AppNotification = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      title: 'Session Started',
      message: `Welcome back, ${user.name}! Syncing local ward alerts.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotify, ...prev]);
  };

  const handleLogout = () => {
    localStorage.removeItem('hero_token');
    setCurrentUser(null);
  };

  const handleNavigate = (view: string, issueIdOrLocation?: any) => {
    if (!currentUser) {
      if (view === 'login' || view === 'landing') {
        const el = document.getElementById('login-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        setCurrentView('landing');
        return;
      }
    }
    if (typeof issueIdOrLocation === 'string') {
      setSelectedIssueId(issueIdOrLocation);
    } else if (issueIdOrLocation && typeof issueIdOrLocation === 'object') {
      setPrefilledLocation(issueIdOrLocation);
    } else if (view !== 'report') {
      setPrefilledLocation(null);
    }
    setCurrentView(view);
  };

  const handleReportIssue = async (newIssue: Partial<Issue>) => {
    if (!currentUser) return;

    // Structure complete record payload
    const payload: Omit<Issue, 'id' | 'createdAt'> = {
      title: newIssue.title || 'Untitled Damage',
      description: newIssue.description || '',
      category: newIssue.category || 'Road Damage',
      priority: newIssue.priority || 'Medium',
      severity: newIssue.severity || 'Medium',
      estimatedImpact: newIssue.estimatedImpact || 150,
      updatedAt: new Date().toISOString(),
      publicCommentsCount: 0,
      imageUrl: newIssue.imageUrl || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800',
      status: 'Reported',
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      location: {
        address: newIssue.location?.address || '120 Mission St, San Francisco, CA',
        lat: newIssue.location?.lat || 37.761,
        lng: newIssue.location?.lng || -122.420,
        ward: newIssue.location?.ward || 'Ward 3 - Mission'
      },
      upvotes: 0,
      verifiedBy: [],
      aiConfidence: newIssue.aiConfidence || 85,
      verificationScore: Math.round((newIssue.aiConfidence || 85) / 10),
      assignedOfficerId: 'officer_brian',
      assignedOfficerName: 'Inspector Brian Chen',
      costEstimate: 0,
      resolutionTimeline: '',
      progressUpdates: [
        {
          status: 'Reported',
          note: 'Incident submitted to ward ledger. AI checking corroborating proximity feeds.',
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.name
        }
      ]
    };

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue: payload, userId: currentUser.id })
      });

      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues);
        setUsersList(data.users);
        setLeaderboard(data.leaderboard);
        
        // Update current authenticated user to sync gamification XP points
        const updatedUsr = data.users.find((u: User) => u.id === currentUser.id);
        if (updatedUsr) setCurrentUser(updatedUsr);

        // Add a notification
        const newNotif: AppNotification = {
          id: 'notif_' + Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          title: 'Ticket Logged!',
          message: `Your report "${payload.title}" has been added. Earned 15 XP!`,
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);

        setCurrentView('citizen-dashboard');
      } else {
        alert('Server processing error. Simulating offline log.');
      }
    } catch (err) {
      console.error("Offline fallback trigger:", err);
      // Fallback state logic
      const fallbackId = 'issue_' + Math.random().toString(36).substr(2, 9);
      const offlineIssue: Issue = {
        ...payload,
        id: fallbackId,
        createdAt: new Date().toISOString()
      };
      
      setIssues(prev => [offlineIssue, ...prev]);
      
      // Update local XP
      const updatedUser = { ...currentUser, points: currentUser.points + 15 };
      setCurrentUser(updatedUser);
      setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

      setCurrentView('citizen-dashboard');
    }
  };

  const handleVote = async (issueId: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues);
        
        // Notify
        const iss = data.issues.find((i: Issue) => i.id === issueId);
        const newNotif: AppNotification = {
          id: 'notif_' + Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          title: 'Endorsement Logged',
          message: `Upvoted ticket "${iss?.title}". Priority score increased.`,
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (err) {
      // Local Fallback
      setIssues(prev => prev.map(iss => {
        if (iss.id === issueId) {
          const up = iss.upvotes + 1;
          return {
            ...iss,
            upvotes: up,
            verificationScore: up + (iss.verifiedBy.length * 5) + Math.round(iss.aiConfidence / 10)
          };
        }
        return iss;
      }));
    }
  };

  const handleVerify = async (issueId: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues);
        setUsersList(data.users);
        setLeaderboard(data.leaderboard);

        const updatedUsr = data.users.find((u: User) => u.id === currentUser.id);
        if (updatedUsr) setCurrentUser(updatedUsr);

        // Notify
        const iss = data.issues.find((i: Issue) => i.id === issueId);
        const newNotif: AppNotification = {
          id: 'notif_' + Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          title: 'Verification Complete!',
          message: `You verified "${iss?.title}". Received 10 XP bounty!`,
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (err) {
      // Local Fallback
      setIssues(prev => prev.map(iss => {
        if (iss.id === issueId) {
          const v = [...iss.verifiedBy, currentUser.id];
          return {
            ...iss,
            verifiedBy: v,
            verificationScore: iss.upvotes + (v.length * 5) + Math.round(iss.aiConfidence / 10)
          };
        }
        return iss;
      }));

      const updatedUser = { ...currentUser, points: currentUser.points + 10 };
      setCurrentUser(updatedUser);
      setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  const handleAddComment = async (issueId: string, content: string, photo?: string) => {
    if (!currentUser) return;

    const payload: Omit<Comment, 'id' | 'createdAt'> = {
      issueId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      evidencePhoto: photo
    };

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: payload })
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (err) {
      const offlineComment: Comment = {
        ...payload,
        id: 'comment_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, offlineComment]);
    }
  };

  const handleUpdateStatus = async (issueId: string, payload: any) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues);
      }
    } catch (err) {
      setIssues(prev => prev.map(iss => {
        if (iss.id === issueId) {
          const updates = [...iss.progressUpdates];
          if (payload.status) {
            updates.push({
              status: payload.status,
              note: payload.note || 'Municipal inspector updated worksite progress logs.',
              updatedAt: new Date().toISOString(),
              updatedBy: payload.officerName || 'Inspector Desk'
            });
          }
          return {
            ...iss,
            status: payload.status || iss.status,
            costEstimate: payload.costEstimate || iss.costEstimate,
            resolutionTimeline: payload.resolutionTimeline || iss.resolutionTimeline,
            progressUpdates: updates
          };
        }
        return iss;
      }));
    }
  };

  const handleModerateIssue = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/delete`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues);
      }
    } catch (err) {
      setIssues(prev => prev.filter(i => i.id !== issueId));
    }
  };

  const handleModifyRole = async (userId: string, newRole: any) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users);
        
        if (currentUser && currentUser.id === userId) {
          const nextUsr = data.users.find((u: User) => u.id === userId);
          if (nextUsr) setCurrentUser(nextUsr);
        }
      }
    } catch (err) {
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Navigation Header - Always visible */}
      <Header
        user={currentUser}
        notifications={notifications}
        darkMode={theme === 'dark'}
        setDarkMode={(dark) => setTheme(dark ? 'dark' : 'light')}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentView={currentView}
      />

      {/* Primary Layout Router Switch */}
      <main className="flex-1 shrink-0">
        {!currentUser ? (
          <LandingPage 
            onNavigate={handleNavigate} 
            user={null} 
            onLoginSuccess={handleLogin} 
          />
        ) : (
          <>
            {currentView === 'landing' && (
              <LandingPage onNavigate={handleNavigate} user={currentUser} />
            )}

            {currentView === 'login' && (
              <LoginRegister onLoginSuccess={handleLogin} />
            )}

            {currentView === 'citizen-dashboard' && currentUser && (
              <CitizenDashboard
                user={currentUser}
                issues={issues}
                notifications={notifications}
                onNavigate={handleNavigate}
                onClearNotifications={() => setNotifications([])}
              />
            )}

            {currentView === 'report' && (
              <ReportIssue
                userId={currentUser.id}
                userName={currentUser.name}
                userAvatar={currentUser.avatar}
                prefilledLocation={prefilledLocation}
                onIssueCreated={async () => {
                  try {
                    const res = await fetch('/api/issues');
                    if (res.ok) setIssues(await res.json());
                    const usersRes = await fetch('/api/users');
                    if (usersRes.ok) setUsersList(await usersRes.json());
                    const leaderRes = await fetch('/api/leaderboard');
                    if (leaderRes.ok) setLeaderboard(await leaderRes.json());
                  } catch (e) {
                    console.error(e);
                  }
                  handleNavigate('citizen-dashboard');
                }}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'issue-details' && currentUser && (
              <IssueDetails
                user={currentUser}
                issueId={selectedIssueId}
                issues={issues}
                comments={comments}
                onBack={() => {
                  if (currentUser.role === 'admin') {
                    handleNavigate('admin-dashboard');
                  } else if (currentUser.role === 'officer') {
                    handleNavigate('officer-dashboard');
                  } else {
                    handleNavigate('citizen-dashboard');
                  }
                }}
                onVote={handleVote}
                onVerify={handleVerify}
                onAddComment={handleAddComment}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {currentView === 'map' && (
              <InteractiveMap
                issues={issues}
                predictions={predictions}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'leaderboard' && (
              <Leaderboard entries={leaderboard} />
            )}

            {currentView === 'analytics' && (
              <AnalyticsDashboard issues={issues} />
            )}

            {currentView === 'assistant' && (
              <AiAssistant userId={currentUser?.id} />
            )}

            {currentView === 'officer-dashboard' && currentUser && (
              <OfficerDashboard
                user={currentUser}
                issues={issues}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'admin-dashboard' && currentUser && (
              <AdminDashboard
                user={currentUser}
                issues={issues}
                usersList={usersList}
                onNavigate={handleNavigate}
                onModerateIssue={handleModerateIssue}
                onModifyRole={handleModifyRole}
              />
            )}
          </>
        )}
      </main>

      {/* Footer - Always visible */}
      <Footer onNavigate={handleNavigate} currentUser={currentUser} />

    </div>
  );
}
