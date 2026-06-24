/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
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
import { User, Issue, Comment, PredictiveHotspot, LeaderboardEntry, Notification as AppNotification } from './types';

// Root level component that sets up standard react-router-dom context
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// Router-wrapped main application component
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

  // Set default view on user authentication change, maintaining compatibility for initial loading and deep links
  useEffect(() => {
    if (!currentUser) {
      if (location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/');
      }
      return;
    }

    // Only auto-redirect to dashboard if the user is on the root index page or login screen
    if (location.pathname === '/' || location.pathname === '/login') {
      if (currentUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (currentUser.role === 'officer') {
        navigate('/officer-dashboard');
      } else {
        navigate('/citizen-dashboard');
      }
    }
  }, [currentUser]);

  // Derived currentView string to keep Header and Footer highlights fully synchronized
  const getCurrentViewFromPath = (pathname: string): string => {
    if (pathname === '/' || pathname === '/landing') return 'landing';
    if (pathname === '/login') return 'login';
    if (pathname === '/citizen-dashboard') return 'citizen-dashboard';
    if (pathname === '/officer-dashboard') return 'officer-dashboard';
    if (pathname === '/admin-dashboard') return 'admin-dashboard';
    if (pathname === '/report') return 'report';
    if (pathname.startsWith('/issue/')) return 'issue-details';
    if (pathname === '/map') return 'map';
    if (pathname === '/leaderboard') return 'leaderboard';
    if (pathname === '/analytics') return 'analytics';
    if (pathname === '/assistant') return 'assistant';
    return 'landing';
  };

  const currentView = getCurrentViewFromPath(location.pathname);

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

    // Role-based navigation after logging in
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (user.role === 'officer') {
      navigate('/officer-dashboard');
    } else {
      navigate('/citizen-dashboard');
    }
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
        navigate('/');
        return;
      }
    }
    if (typeof issueIdOrLocation === 'string') {
      setSelectedIssueId(issueIdOrLocation);
      navigate(`/issue/${issueIdOrLocation}`);
    } else if (issueIdOrLocation && typeof issueIdOrLocation === 'object') {
      setPrefilledLocation(issueIdOrLocation);
      navigate('/report');
    } else {
      setPrefilledLocation(null);
      if (view === 'landing') navigate('/');
      else if (view === 'login') navigate('/login');
      else if (view === 'citizen-dashboard') navigate('/citizen-dashboard');
      else if (view === 'officer-dashboard') navigate('/officer-dashboard');
      else if (view === 'admin-dashboard') navigate('/admin-dashboard');
      else if (view === 'report') navigate('/report');
      else if (view === 'map') navigate('/map');
      else if (view === 'leaderboard') navigate('/leaderboard');
      else if (view === 'analytics') navigate('/analytics');
      else if (view === 'assistant') navigate('/assistant');
    }
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

        navigate('/citizen-dashboard');
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

      navigate('/citizen-dashboard');
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
        <Routes>
          {/* Landing / Homepage Route */}
          <Route path="/" element={
            <LandingPage 
              onNavigate={handleNavigate} 
              user={currentUser} 
              onLoginSuccess={handleLogin} 
            />
          } />

          {/* Login / Signup Route */}
          <Route path="/login" element={
            currentUser ? (
              <Navigate to={
                currentUser.role === 'admin' 
                  ? '/admin-dashboard' 
                  : currentUser.role === 'officer' 
                    ? '/officer-dashboard' 
                    : '/citizen-dashboard'
              } replace />
            ) : (
              <LoginRegister onLoginSuccess={handleLogin} />
            )
          } />

          {/* Citizen Dashboard */}
          <Route path="/citizen-dashboard" element={
            currentUser ? (
              <CitizenDashboard
                user={currentUser}
                issues={issues}
                notifications={notifications}
                onNavigate={handleNavigate}
                onClearNotifications={() => setNotifications([])}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Report an Issue */}
          <Route path="/report" element={
            currentUser ? (
              <ReportIssue
                userId={currentUser.id}
                userName={currentUser.name}
                userAvatar={currentUser.avatar}
                prefilledLocation={prefilledLocation}
                onIssueCreated={handleReportIssue}
                onNavigate={handleNavigate}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Detailed Issue Page */}
          <Route path="/issue/:id" element={
            currentUser ? (
              <IssueDetailsRouteWrapper
                user={currentUser}
                issues={issues}
                comments={comments}
                onBack={() => {
                  if (currentUser.role === 'admin') {
                    navigate('/admin-dashboard');
                  } else if (currentUser.role === 'officer') {
                    navigate('/officer-dashboard');
                  } else {
                    navigate('/citizen-dashboard');
                  }
                }}
                onVote={handleVote}
                onVerify={handleVerify}
                onAddComment={handleAddComment}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Interactive Map */}
          <Route path="/map" element={
            currentUser ? (
              <InteractiveMap
                issues={issues}
                predictions={predictions}
                onNavigate={handleNavigate}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Leaderboard & Badges */}
          <Route path="/leaderboard" element={
            currentUser ? (
              <Leaderboard entries={leaderboard} />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Analytics Dashboard */}
          <Route path="/analytics" element={
            currentUser ? (
              <AnalyticsDashboard issues={issues} />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* AI Assistant Chatbot */}
          <Route path="/assistant" element={
            currentUser ? (
              <AiAssistant userId={currentUser?.id} />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Officer Dashboard */}
          <Route path="/officer-dashboard" element={
            currentUser ? (
              <OfficerDashboard
                user={currentUser}
                issues={issues}
                onNavigate={handleNavigate}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Administrator Panel */}
          <Route path="/admin-dashboard" element={
            currentUser ? (
              <AdminDashboard
                user={currentUser}
                issues={issues}
                usersList={usersList}
                onNavigate={handleNavigate}
                onModerateIssue={handleModerateIssue}
                onModifyRole={handleModifyRole}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Wildcard / Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer - Always visible */}
      <Footer onNavigate={handleNavigate} currentUser={currentUser} />

    </div>
  );
}

interface IssueDetailsRouteWrapperProps {
  user: User;
  issues: Issue[];
  comments: Comment[];
  onBack: () => void;
  onVote: (issueId: string) => Promise<void>;
  onVerify: (issueId: string) => Promise<void>;
  onAddComment: (issueId: string, content: string, photo?: string) => Promise<void>;
  onUpdateStatus: (issueId: string, payload: any) => Promise<void>;
}

// Wrapper component to grab the dynamic issue ID parameter from the URL path
function IssueDetailsRouteWrapper({
  user,
  issues,
  comments,
  onBack,
  onVote,
  onVerify,
  onAddComment,
  onUpdateStatus
}: IssueDetailsRouteWrapperProps) {
  const { id } = useParams<{ id: string }>();
  return (
    <IssueDetails
      user={user}
      issueId={id || ''}
      issues={issues}
      comments={comments}
      onBack={onBack}
      onVote={onVote}
      onVerify={onVerify}
      onAddComment={onAddComment}
      onUpdateStatus={onUpdateStatus}
    />
  );
}
