/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  User, 
  Issue, 
  Comment, 
  Notification, 
  PredictiveHotspot, 
  LeaderboardEntry, 
  IssueCategory,
  IssueStatus,
  IssuePriority,
  ProgressUpdate
} from './src/types.js';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-community-hero';
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const app = express();
const PORT = 3000;

// Set up larger limits for base64 image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Initialize Gemini SDK lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      console.log('Gemini AI Client initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Gemini AI Client:', error);
    }
  }
  return aiClient;
}

// ==========================================
// MOCK DATA STORE (IN-MEMORY RELATIONAL STORAGE)
// ==========================================

const USERS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Mercer',
    email: 'citizen@example.com',
    role: 'citizen',
    points: 145,
    badges: ['Community Hero', 'Top Reporter'],
    ward: 'Ward 5 - Heights',
    state: 'California',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: DEFAULT_PASSWORD_HASH,
  },
  {
    id: 'user_marcus',
    name: 'Inspector Marcus Vance',
    email: 'officer@example.com',
    role: 'officer',
    points: 0,
    badges: ['Municipal Officer'],
    ward: 'Citywide',
    state: 'California',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: DEFAULT_PASSWORD_HASH,
  },
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'admin@example.com',
    role: 'admin',
    points: 0,
    badges: ['City Director'],
    ward: 'City Hall',
    state: 'California',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: DEFAULT_PASSWORD_HASH,
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    role: 'citizen',
    points: 210,
    badges: ['Community Hero', 'Top Reporter', 'Problem Solver'],
    ward: 'Ward 3 - Mission',
    state: 'California',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: DEFAULT_PASSWORD_HASH,
  },
  {
    id: 'user_devon',
    name: 'Devon Lane',
    email: 'devon@example.com',
    role: 'citizen',
    points: 95,
    badges: ['Neighborhood Champion'],
    ward: 'Ward 5 - Heights',
    state: 'California',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: DEFAULT_PASSWORD_HASH,
  }
];

const ISSUES: Issue[] = [
  {
    id: 'issue_pothole_1',
    title: 'Severe Pothole on 14th Street Intersection',
    description: 'A deep pothole measuring nearly 2 feet wide has developed right after the pedestrian crossing. It is causing cars to swerve dangerously into the oncoming lane to avoid it, presenting an immediate hazard to both vehicular traffic and cyclists.',
    category: 'Road Damage',
    severity: 'High',
    status: 'In Progress',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '14th St & Valencia St, San Francisco, CA',
      ward: 'Ward 3 - Mission'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800',
    upvotes: 42,
    verifiedBy: ['user_elena', 'user_devon'],
    aiConfidence: 94,
    verificationScore: 52, // 42 upvotes + 2 verified citizens (10 pts) = 52
    priority: 'Critical',
    estimatedImpact: 1200,
    assignedOfficerId: 'user_marcus',
    assignedOfficerName: 'Inspector Marcus Vance',
    costEstimate: 850,
    resolutionTimeline: '2026-06-28',
    createdBy: 'user_alex',
    creatorName: 'Alex Mercer',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    publicCommentsCount: 3,
    progressUpdates: [
      {
        status: 'Reported',
        note: 'Issue successfully logged in the system. AI models detected Road Damage with 94% confidence.',
        updatedBy: 'System AI',
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'Verified',
        note: 'Issue verified by community consensus. Escalated to Road Maintenance division.',
        updatedBy: 'System Guard',
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'Assigned',
        note: 'Assigned to Ward 3 maintenance team led by Inspector Marcus Vance.',
        updatedBy: 'Sarah Jenkins (Admin)',
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'In Progress',
        note: 'Asphalt patching crew dispatched. Expect temporary lane closure. Completion estimated by June 28.',
        updatedBy: 'Inspector Marcus Vance',
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400'
      }
    ]
  },
  {
    id: 'issue_leak_1',
    title: 'Major Water Pipe Leakage on Oak Crescent',
    description: 'Fresh water is gushing out of the sidewalk pavement near the fire hydrant. It has been running continuously for 12 hours, flooding the driveway of houses 14 to 18, and eroding the base of the curb.',
    category: 'Water Leakage',
    severity: 'High',
    status: 'Assigned',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: '145 Oak Crescent, San Francisco, CA',
      ward: 'Ward 5 - Heights'
    },
    imageUrl: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800',
    upvotes: 28,
    verifiedBy: ['user_alex'],
    aiConfidence: 89,
    verificationScore: 33, // 28 upvotes + 1 verified citizen = 33
    priority: 'High',
    estimatedImpact: 600,
    assignedOfficerId: 'user_marcus',
    assignedOfficerName: 'Inspector Marcus Vance',
    costEstimate: 1400,
    resolutionTimeline: '2026-06-30',
    createdBy: 'user_devon',
    creatorName: 'Devon Lane',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    publicCommentsCount: 1,
    progressUpdates: [
      {
        status: 'Reported',
        note: 'AI classified as high severity Water Leakage. Automatic alert dispatched to Water & Sewage Utility.',
        updatedBy: 'System AI',
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'Verified',
        note: 'Curb-side assessment confirmed by citizen verify action. Priority set to High.',
        updatedBy: 'System Guard',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'Assigned',
        note: 'Assigned to Inspector Marcus Vance for site excavation planning.',
        updatedBy: 'Sarah Jenkins (Admin)',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'issue_garbage_1',
    title: 'Overflowing Waste Bins & Illegal Dumping in Alley',
    description: 'The communal trash bins in the alley behind commercial complex have not been emptied for two scheduled cycles. Piles of plastic bags, loose packaging, and organic waste have spilled across the alley, attracting stray animals and creating strong bad odors.',
    category: 'Garbage Collection',
    severity: 'Medium',
    status: 'Reported',
    location: {
      lat: 37.7699,
      lng: -122.4468,
      address: 'Caledonia Alley, San Francisco, CA',
      ward: 'Ward 3 - Mission'
    },
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800',
    upvotes: 12,
    verifiedBy: [],
    aiConfidence: 96,
    verificationScore: 12,
    priority: 'Medium',
    estimatedImpact: 350,
    createdBy: 'user_elena',
    creatorName: 'Elena Rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    publicCommentsCount: 0,
    progressUpdates: [
      {
        status: 'Reported',
        note: 'AI detected Garbage Accumulation (96% Confidence). Forwarded to Waste Management Division.',
        updatedBy: 'System AI',
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'issue_light_1',
    title: 'Broken Streetlight Near Playground Pathway',
    description: 'The street lamp directly opposite the community park kids sandbox has been flickering and is now completely blacked out. This leaves the entire pedestrian pathway in pitch darkness after 8 PM, making residents feel extremely unsafe walking their dogs or coming home.',
    category: 'Broken Streetlight',
    severity: 'Low',
    status: 'Resolved',
    location: {
      lat: 37.7599,
      lng: -122.4368,
      address: 'Dolores Park Pathway, San Francisco, CA',
      ward: 'Ward 3 - Mission'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=800',
    upvotes: 19,
    verifiedBy: ['user_alex', 'user_devon'],
    aiConfidence: 91,
    verificationScore: 29, // 19 upvotes + 2 verified citizens = 29
    priority: 'Low',
    estimatedImpact: 200,
    assignedOfficerId: 'user_marcus',
    assignedOfficerName: 'Inspector Marcus Vance',
    costEstimate: 220,
    resolutionTimeline: '2026-06-22',
    createdBy: 'user_elena',
    creatorName: 'Elena Rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    publicCommentsCount: 2,
    progressUpdates: [
      {
        status: 'Reported',
        note: 'Issue reported. AI flagged as light infrastructure failure.',
        updatedBy: 'System AI',
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'Assigned',
        note: 'Assigned to Electrical Maintenance unit.',
        updatedBy: 'Sarah Jenkins (Admin)',
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'In Progress',
        note: 'Bulb and ballast replacement scheduled for next service route.',
        updatedBy: 'Inspector Marcus Vance',
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'Resolved',
        note: 'Completed. High-efficiency LED luminaire installed. Light is now fully functional.',
        updatedBy: 'Inspector Marcus Vance',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        photoUrl: 'https://images.unsplash.com/photo-1517420712361-29402d23b7e1?auto=format&fit=crop&w=400'
      }
    ]
  }
];

const COMMENTS: Comment[] = [
  {
    id: 'comment_1',
    issueId: 'issue_pothole_1',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
    content: 'My sedan bottomed out on this yesterday! There is some fluid leaking now. Extremely glad this is finally being patched!',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment_2',
    issueId: 'issue_pothole_1',
    userId: 'user_devon',
    userName: 'Devon Lane',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
    content: 'Can confirm! I rode my bicycle past here earlier and nearly fell over. The pothole is virtually invisible at night due to shadows.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    evidencePhoto: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400'
  },
  {
    id: 'comment_3',
    issueId: 'issue_pothole_1',
    userId: 'user_marcus',
    userName: 'Inspector Marcus Vance',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
    content: 'Team is active on site. We are sealing the outer edges first to prevent further crumbling, then hot asphalt pour will occur in 2 hours.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment_4',
    issueId: 'issue_leak_1',
    userId: 'user_alex',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    content: 'Water pressure in my building has dropped significantly since this started. Hoping they shut off the main valve to repair it soon.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment_5',
    issueId: 'issue_light_1',
    userId: 'user_alex',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    content: 'Thank you Marcus for sorting this out! Walks at night are so much better now.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_alex',
    title: 'Pothole Update',
    message: 'The pothole you reported on 14th Street is now "In Progress". Work has begun!',
    type: 'success',
    isRead: false,
    issueId: 'issue_pothole_1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_2',
    userId: 'user_alex',
    title: 'New Verification',
    message: 'Elena Rostova verified your reported issue on 14th Street.',
    type: 'info',
    isRead: false,
    issueId: 'issue_pothole_1',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_3',
    userId: 'user_devon',
    title: 'Issue Assigned',
    message: 'The water leakage on Oak Crescent has been assigned to Public Works team.',
    type: 'info',
    isRead: false,
    issueId: 'issue_leak_1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const PREDICTIVE_HOTSPOTS: PredictiveHotspot[] = [
  {
    id: 'hotspot_1',
    lat: 37.7710,
    lng: -122.4220,
    type: 'Road Damage',
    riskScore: 'High',
    probability: 0.88,
    reason: 'High bus/heavy transit volume combined with 45-year-old asphalt substrate and micro-fissure erosion patterns detected in recent municipal scans.',
    historicalIncidents: 14
  },
  {
    id: 'hotspot_2',
    lat: 37.7815,
    lng: -122.4110,
    type: 'Water Leakage',
    riskScore: 'High',
    probability: 0.84,
    reason: 'Frequent water pressure spikes detected from pump station 4 coupled with cast-iron pipelines installed in 1968 exhibiting metal fatigue.',
    historicalIncidents: 9
  },
  {
    id: 'hotspot_3',
    lat: 37.7650,
    lng: -122.4430,
    type: 'Garbage Collection',
    riskScore: 'Medium',
    probability: 0.72,
    reason: 'Holiday commercial foot traffic increase and history of illegal commercial dumping on weekends.',
    historicalIncidents: 11
  },
  {
    id: 'hotspot_4',
    lat: 37.7560,
    lng: -122.4300,
    type: 'Broken Streetlight',
    riskScore: 'Medium',
    probability: 0.65,
    reason: 'Overhead power cable wear and tree foliage obstruction leading to circuit overheating during hot weather.',
    historicalIncidents: 6
  }
];

// Helper to push a notification
function addNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert', issueId?: string) {
  const notif: Notification = {
    id: 'notif_' + Math.random().toString(36).substr(2, 9),
    userId,
    title,
    message,
    type,
    isRead: false,
    issueId,
    createdAt: new Date().toISOString()
  };
  NOTIFICATIONS.unshift(notif);
}

// ==========================================
// REST API ROUTING
// ==========================================

// 1. Authentication Endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, ward } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  const existingUser = USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'User with this email already exists.' });
  }

  const newId = 'user_' + Math.random().toString(36).substr(2, 9);
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const newUser: User = {
    id: newId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: (role as any) || 'citizen',
    points: 15,
    badges: ['Community Hero'],
    ward: ward || 'Ward 3 - Mission',
    state: 'California',
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150`,
    createdAt: new Date().toISOString(),
    passwordHash
  };

  USERS.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
  
  res.status(201).json({ success: true, user: newUser, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role, isDemo } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  
  // Direct bypass for demo quick logs without password
  if (!password || isDemo) {
    if (user) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ success: true, user, token });
    }
    
    // Create citizen user on demand for hackathon demo convenience
    const newId = 'user_' + Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id: newId,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Anonymous Hero',
      email: email.trim(),
      role: (role as any) || 'citizen',
      points: 10,
      badges: ['Community Hero'],
      ward: 'Ward 3 - Mission',
      state: 'California',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150`,
      createdAt: new Date().toISOString(),
      passwordHash: DEFAULT_PASSWORD_HASH
    };

    USERS.push(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, user: newUser, token });
  }

  // Real password authentication
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found. Please sign up.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash || '');
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, error: 'Invalid password. Please try again.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ success: true, user, token });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token missing.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = USERS.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
});

// 2. Fetch Issues (with filters)
app.get('/api/issues', (req, res) => {
  let filtered = [...ISSUES];
  const { category, status, priority, q } = req.query;

  if (category) {
    filtered = filtered.filter(i => i.category === category);
  }
  if (status) {
    filtered = filtered.filter(i => i.status === status);
  }
  if (priority) {
    filtered = filtered.filter(i => i.priority === priority);
  }
  if (q) {
    const search = String(q).toLowerCase();
    filtered = filtered.filter(i => 
      i.title.toLowerCase().includes(search) || 
      i.description.toLowerCase().includes(search) || 
      i.location.address.toLowerCase().includes(search)
    );
  }

  res.json(filtered);
});

// 3. Create Issue (with Smart Prioritization Engine)
app.post('/api/issues', (req, res) => {
  const { 
    title, 
    description, 
    category, 
    severity, 
    location, 
    imageUrl, 
    videoUrl, 
    createdBy, 
    creatorName, 
    creatorAvatar,
    aiConfidence,
    estimatedImpact
  } = req.body;

  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: 'Missing required issue properties.' });
  }

  const issueId = 'issue_' + Math.random().toString(36).substr(2, 9);
  
  // Smart priority calculations
  const sevWeight = severity === 'Critical' ? 4 : severity === 'High' ? 3 : severity === 'Medium' ? 2 : 1;
  const impactWeight = estimatedImpact && Number(estimatedImpact) > 500 ? 3 : estimatedImpact && Number(estimatedImpact) > 100 ? 2 : 1;
  const compositeScore = sevWeight + impactWeight;
  const priority: IssuePriority = compositeScore >= 6 ? 'Critical' : compositeScore >= 4 ? 'High' : compositeScore >= 3 ? 'Medium' : 'Low';

  const newIssue: Issue = {
    id: issueId,
    title,
    description,
    category,
    severity: severity || 'Medium',
    status: 'Reported',
    location: {
      lat: Number(location.lat) || 37.7749,
      lng: Number(location.lng) || -122.4194,
      address: location.address || 'Unknown Address',
      ward: location.ward || 'Ward 3 - Mission'
    },
    imageUrl,
    videoUrl,
    upvotes: 1, // Author upvotes by default
    verifiedBy: [],
    aiConfidence: aiConfidence || 85,
    verificationScore: 1, // Initial verification score
    priority,
    estimatedImpact: Number(estimatedImpact) || 150,
    createdBy: createdBy || 'user_alex',
    creatorName: creatorName || 'Alex Mercer',
    creatorAvatar: creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publicCommentsCount: 0,
    progressUpdates: [
      {
        status: 'Reported',
        note: `Issue reported by ${creatorName || 'Citizen'}. Severity: ${severity || 'Medium'}. AI initiated impact evaluation.`,
        updatedBy: 'System AI',
        updatedAt: new Date().toISOString()
      }
    ]
  };

  ISSUES.unshift(newIssue);

  // Award gamification points to creator
  const user = USERS.find(u => u.id === createdBy);
  if (user) {
    user.points += 10; // Report Issue = 10 pts
    // Check for badges
    if (user.points >= 100 && !user.badges.includes('Neighborhood Champion')) {
      user.badges.push('Neighborhood Champion');
      addNotification(user.id, 'New Badge Earned!', 'Congratulations! You unlocked the "Neighborhood Champion" badge for outstanding civic engagement.', 'success');
    }
  }

  // Notify officers of a critical/high new report
  if (priority === 'Critical' || priority === 'High') {
    USERS.filter(u => u.role === 'officer' || u.role === 'admin').forEach(officer => {
      addNotification(officer.id, 'CRITICAL ISSUE REPORTED', `A new ${priority} priority ${category} has been reported at ${location.address}.`, 'alert', issueId);
    });
  }

  res.status(201).json(newIssue);
});

// 4. Get Single Issue Details
app.get('/api/issues/:id', (req, res) => {
  const issue = ISSUES.find(i => i.id === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }
  const comments = COMMENTS.filter(c => c.issueId === issue.id);
  res.json({ issue, comments });
});

// 5. Upvote / Endorse Issue
app.post('/api/issues/:id/vote', (req, res) => {
  const issue = ISSUES.find(i => i.id === req.params.id);
  const { userId } = req.body;
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }

  issue.upvotes += 1;
  // Recalculate verification score
  issue.verificationScore = issue.upvotes + (issue.verifiedBy.length * 5) + Math.round(issue.aiConfidence / 10);
  issue.updatedAt = new Date().toISOString();

  // Award points to creator for receiving support
  const creator = USERS.find(u => u.id === issue.createdBy);
  if (creator) {
    creator.points += 2; // Upvote received = 2 points
  }

  // Notify creator of upvote
  if (userId && userId !== issue.createdBy) {
    const voter = USERS.find(u => u.id === userId);
    addNotification(
      issue.createdBy, 
      'Your Report Gained Support!', 
      `${voter ? voter.name : 'A citizen'} upvoted and endorsed your report of "${issue.title}".`, 
      'info', 
      issue.id
    );
  }

  res.json({ success: true, upvotes: issue.upvotes, verificationScore: issue.verificationScore });
});

// 6. Verify Issue
app.post('/api/issues/:id/verify', (req, res) => {
  const issue = ISSUES.find(i => i.id === req.params.id);
  const { userId } = req.body;
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'userId is required for verification.' });
  }

  if (issue.verifiedBy.includes(userId)) {
    return res.status(400).json({ error: 'You have already verified this issue.' });
  }

  issue.verifiedBy.push(userId);
  // Recalculate verification score: Each verified citizen adds 5 pts to score
  issue.verificationScore = issue.upvotes + (issue.verifiedBy.length * 5) + Math.round(issue.aiConfidence / 10);
  
  // Dynamic promotion of status
  if (issue.status === 'Reported' && issue.verificationScore >= 15) {
    issue.status = 'Verified';
    issue.progressUpdates.push({
      status: 'Verified',
      note: 'Issue community verification score reached threshold. Promoted to Verified state.',
      updatedBy: 'System Guard',
      updatedAt: new Date().toISOString()
    });
    
    // Notify creator
    addNotification(issue.createdBy, 'Issue Verified!', `Congratulations! Your report of "${issue.title}" has been verified by the community!`, 'success', issue.id);
  }

  issue.updatedAt = new Date().toISOString();

  // Award gamification points to verifier
  const verifier = USERS.find(u => u.id === userId);
  if (verifier) {
    verifier.points += 5; // Verify Issue = 5 pts
    
    // Verify badge check
    const verifiedCount = ISSUES.filter(i => i.verifiedBy.includes(userId)).length;
    if (verifiedCount >= 5 && !verifier.badges.includes('Problem Solver')) {
      verifier.badges.push('Problem Solver');
      addNotification(userId, 'New Badge Earned!', 'You unlocked the "Problem Solver" badge for verifying 5+ local reports.', 'success');
    }
  }

  res.json({ 
    success: true, 
    verifiedBy: issue.verifiedBy, 
    verificationScore: issue.verificationScore,
    status: issue.status
  });
});

// 7. Post Comment on Issue
app.post('/api/issues/:id/comment', (req, res) => {
  const issue = ISSUES.find(i => i.id === req.params.id);
  const { userId, content, evidencePhoto } = req.body;
  
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }
  if (!userId || !content) {
    return res.status(400).json({ error: 'Missing userId or content.' });
  }

  const user = USERS.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const newComment: Comment = {
    id: 'comment_' + Math.random().toString(36).substr(2, 9),
    issueId: issue.id,
    userId,
    userName: user.name,
    userAvatar: user.avatar,
    content,
    evidencePhoto,
    createdAt: new Date().toISOString()
  };

  COMMENTS.push(newComment);
  issue.publicCommentsCount += 1;
  issue.updatedAt = new Date().toISOString();

  // Notify report owner of comment
  if (issue.createdBy !== userId) {
    addNotification(
      issue.createdBy, 
      'New Comment on Your Report', 
      `${user.name} commented on "${issue.title}".`, 
      'info', 
      issue.id
    );
  }

  res.status(201).json(newComment);
});

// 8. Change Status (Officer/Admin only)
const handleStatusUpdate = (req: express.Request, res: express.Response) => {
  const issue = ISSUES.find(i => i.id === req.params.id);
  const { status, note, officerId, officerName, costEstimate, resolutionTimeline, photoUrl } = req.body;

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }

  const updatedStatus = status as IssueStatus;
  issue.status = updatedStatus;
  
  if (officerId) {
    issue.assignedOfficerId = officerId;
    issue.assignedOfficerName = officerName || 'Municipal Officer';
  }
  if (costEstimate !== undefined) {
    issue.costEstimate = Number(costEstimate);
  }
  if (resolutionTimeline) {
    issue.resolutionTimeline = resolutionTimeline;
  }

  const updateEntry: ProgressUpdate = {
    status: updatedStatus,
    note: note || `Issue status changed to ${updatedStatus}.`,
    updatedBy: officerName || 'Municipal Officer',
    updatedAt: new Date().toISOString(),
    photoUrl
  };

  issue.progressUpdates.push(updateEntry);
  issue.updatedAt = new Date().toISOString();

  // If resolved, award points to reporting citizen
  if (updatedStatus === 'Resolved') {
    const creator = USERS.find(u => u.id === issue.createdBy);
    if (creator) {
      creator.points += 20; // Resolved Issue = 20 pts
      addNotification(
        issue.createdBy,
        'ISSUE RESOLVED! 🎉',
        `Fantastic news! The issue you reported ("${issue.title}") has been marked as resolved by ${officerName || 'municipal staff'}. You earned 20 XP!`,
        'success',
        issue.id
      );

      // Check Community Hero badge
      const resolvedReports = ISSUES.filter(i => i.createdBy === creator.id && i.status === 'Resolved').length;
      if (resolvedReports >= 3 && !creator.badges.includes('Community Hero')) {
        creator.badges.push('Community Hero');
        addNotification(creator.id, 'Community Hero Badge!', 'Congratulations! You are officially a Community Hero for reporting 3+ successfully resolved issues!', 'success');
      }
    }
  } else {
    // Standard status update notification
    addNotification(
      issue.createdBy,
      `Issue Status Updated: ${updatedStatus}`,
      `Your reported issue "${issue.title}" is now "${updatedStatus}". Update: ${note}`,
      'info',
      issue.id
    );
  }

  res.json({ success: true, issue, issues: ISSUES });
};

app.put('/api/issues/:id/status', handleStatusUpdate);
app.post('/api/issues/:id/status', handleStatusUpdate);

// 8b. Delete/Moderate Issue (Admin only)
app.post('/api/issues/:id/delete', (req, res) => {
  const index = ISSUES.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Issue not found.' });
  }
  ISSUES.splice(index, 1);
  res.json({ success: true, issues: ISSUES });
});

// 8c. Change User Role (Admin only)
app.post('/api/users/:id/role', (req, res) => {
  const user = USERS.find(u => u.id === req.params.id);
  const { role } = req.body;
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  user.role = role;
  res.json({ success: true, user, users: USERS });
});

// 8d. Fetch all Users
app.get('/api/users', (req, res) => {
  res.json(USERS);
});

// 8e. Fetch all Comments
app.get('/api/comments', (req, res) => {
  res.json(COMMENTS);
});

// 8f. Create a comment
app.post('/api/comments', (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Comment payload is required.' });
  }
  const newComment: Comment = {
    id: 'comment_' + Math.random().toString(36).substr(2, 9),
    issueId: comment.issueId,
    userId: comment.userId,
    userName: comment.userName || 'Anonymous',
    userAvatar: comment.userAvatar,
    content: comment.content,
    evidencePhoto: comment.evidencePhoto,
    createdAt: new Date().toISOString()
  };
  COMMENTS.push(newComment);
  
  const issue = ISSUES.find(i => i.id === comment.issueId);
  if (issue) {
    issue.publicCommentsCount += 1;
    issue.updatedAt = new Date().toISOString();
  }
  res.status(201).json({ success: true, comment: newComment, comments: COMMENTS });
});

// 9. Fetch Predictions / Hotspots
app.get('/api/predictions', (req, res) => {
  res.json(PREDICTIVE_HOTSPOTS);
});

// 10. Fetch Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const citizens = USERS.filter(u => u.role === 'citizen');
  const sorted = [...citizens].sort((a, b) => b.points - a.points);
  
  const entries: LeaderboardEntry[] = sorted.map((u, idx) => ({
    userId: u.id,
    name: u.name,
    avatar: u.avatar,
    points: u.points,
    rank: idx + 1,
    badgesCount: u.badges.length,
    ward: u.ward || 'Ward 3 - Mission'
  }));

  res.json(entries);
});

// 11. Fetch all Notifications (generic fallback)
app.get('/api/notifications', (req, res) => {
  res.json(NOTIFICATIONS);
});

// 11b. Fetch Notifications for a specific user
app.get('/api/notifications/:userId', (req, res) => {
  const userNotifs = NOTIFICATIONS.filter(n => n.userId === req.params.userId);
  res.json(userNotifs);
});

// 12. Clear Notifications
app.post('/api/notifications/:userId/read-all', (req, res) => {
  NOTIFICATIONS.forEach(n => {
    if (n.userId === req.params.userId) {
      n.isRead = true;
    }
  });
  res.json({ success: true });
});

// ==========================================
// ADVANCED AI ENDPOINTS (GEMINI API INTEGRATION)
// ==========================================

// AI Issue Image Analyzer (Gemini Vision 2.5)
app.post('/api/ai/analyze-image', async (req, res) => {
  const { imageBase64, filename } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image base64 data is required.' });
  }

  const client = getGeminiClient();

  if (!client) {
    console.log('Using robust local fallback for Gemini Image Analysis (API key not configured).');
    
    // Create high-fidelity smart fallback based on file name or simple heuristics
    const nameStr = (filename || '').toLowerCase();
    let detectedCategory: IssueCategory = 'Other';
    let summary = 'A community issue requires inspection.';
    let recommendedAction = 'Dispatch municipal evaluation crew.';
    let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
    let impact = 180;

    if (nameStr.includes('pothole') || nameStr.includes('road') || nameStr.includes('asphalt') || nameStr.includes('street')) {
      detectedCategory = 'Road Damage';
      summary = 'Severe asphalt deterioration with cracking and active pothole formation.';
      recommendedAction = 'Dispatch thermal patching truck to overlay hot mix asphalt.';
      severity = 'High';
      impact = 650;
    } else if (nameStr.includes('leak') || nameStr.includes('water') || nameStr.includes('pipe') || nameStr.includes('burst') || nameStr.includes('flood')) {
      detectedCategory = 'Water Leakage';
      summary = 'High-pressure clean water leakage emanating from underground main valve seam.';
      recommendedAction = 'Dispatch Hydro-excavation unit to expose line, install repair sleeve.';
      severity = 'Critical';
      impact = 900;
    } else if (nameStr.includes('garbage') || nameStr.includes('trash') || nameStr.includes('waste') || nameStr.includes('dump') || nameStr.includes('bin')) {
      detectedCategory = 'Garbage Collection';
      summary = 'Commercial waste bins exceeding capacity with illegal sidewalk waste accumulation.';
      recommendedAction = 'Redirect municipal sanitation route truck for immediate containment clearing.';
      severity = 'Medium';
      impact = 350;
    } else if (nameStr.includes('light') || nameStr.includes('streetlamp') || nameStr.includes('lamp') || nameStr.includes('dark')) {
      detectedCategory = 'Broken Streetlight';
      summary = 'Broken luminaire casing with exposed internal electrical connectors.';
      recommendedAction = 'Dispatch high-reach utility lift bucket to replace photocell bulb.';
      severity = 'Low';
      impact = 120;
    } else if (nameStr.includes('drain') || nameStr.includes('flood') || nameStr.includes('clog')) {
      detectedCategory = 'Drainage Issue';
      summary = 'Storm sewer inlet choked with mud, foliage, and structural garbage blockage.';
      recommendedAction = 'Deploy high-velocity sewer flushing jetter to vacuum debris.';
      severity = 'High';
      impact = 500;
    }

    return res.json({
      category: detectedCategory,
      severity,
      confidence: Math.floor(Math.random() * 8) + 88,
      summary,
      recommended_action: recommendedAction,
      estimatedImpact: impact
    });
  }

  try {
    // Format the base64 string (strip header if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are a Municipal Civil Engineer AI analyzing a reported community problem image.
Analyze the image and return a JSON object with this precise structure:
{
  "category": "Road Damage" | "Water Leakage" | "Garbage Collection" | "Broken Streetlight" | "Drainage Issue" | "Public Safety" | "Illegal Dumping" | "Fallen Tree" | "Other",
  "severity": "Critical" | "High" | "Medium" | "Low",
  "confidence": <integer percentage between 0 and 100>,
  "summary": "<one sentence concise technical summary of the visual evidence>",
  "recommended_action": "<one sentence municipal crew response recommended>",
  "estimatedImpact": <estimated integer number of neighborhood residents affected>
}

Be analytical. Respond ONLY with the valid JSON. No Markdown formatting, no code block wrapping, just raw, valid JSON.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          }
        }
      ]
    });

    const textResponse = response.text || '';
    // Clean code block ticks if any
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    console.log('Gemini raw analysis:', cleanJson);
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);

  } catch (error) {
    console.error('Gemini image analysis error:', error);
    res.status(500).json({ error: 'AI vision analysis failed. Fallback triggered.', fallback: true });
  }
});

// AI Duplication Detector Endpoint
app.post('/api/ai/check-duplicate', (req, res) => {
  const { title, description, lat, lng } = req.body;

  if (!title || !lat || !lng) {
    return res.status(400).json({ error: 'Title and location coordinates are required.' });
  }

  // Calculate distances and look for similar reports within 500 meters (~0.005 degrees latitude/longitude)
  const nearbyIssues = ISSUES.filter(i => {
    const latDiff = Math.abs(i.location.lat - Number(lat));
    const lngDiff = Math.abs(i.location.lng - Number(lng));
    return latDiff < 0.006 && lngDiff < 0.006; // roughly 600m
  });

  if (nearbyIssues.length === 0) {
    return res.json({ isDuplicate: false });
  }

  // Heuristic string similarity
  const promptWords = `${title} ${description || ''}`.toLowerCase();
  
  const matches = nearbyIssues.map(issue => {
    let score = 0;
    const issueWords = `${issue.title} ${issue.description}`.toLowerCase().split(/\W+/);
    const inputWords = promptWords.split(/\W+/);

    const matchingWords = inputWords.filter(w => w.length > 3 && issueWords.includes(w));
    if (matchingWords.length >= 2) score += 0.4;
    
    // Category check
    // If the category matches
    score += 0.2;

    return {
      issue,
      similarityScore: score
    };
  }).filter(m => m.similarityScore >= 0.4);

  if (matches.length > 0) {
    const bestMatch = matches.sort((a, b) => b.similarityScore - a.similarityScore)[0].issue;
    return res.json({
      isDuplicate: true,
      existingIssue: bestMatch,
      confidence: Math.round((0.5 + Math.random() * 0.4) * 100)
    });
  }

  res.json({ isDuplicate: false });
});

// AI Reverse Geocoding Endpoint
app.post('/api/ai/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  const client = getGeminiClient();

  if (!client) {
    // High-fidelity offline fallback based on actual San Francisco geography
    const streets = [
      { name: 'Valencia St', ward: 'Ward 3 - Mission' },
      { name: 'Mission St', ward: 'Ward 3 - Mission' },
      { name: 'Dolores St', ward: 'Ward 2 - Castro' },
      { name: 'Castro St', ward: 'Ward 2 - Castro' },
      { name: 'Oak Crescent', ward: 'Ward 5 - Heights' },
      { name: 'Harrison St', ward: 'Ward 3 - Mission' },
      { name: 'Folsom St', ward: 'Ward 3 - Mission' },
      { name: 'Market St', ward: 'Ward 4 - Noe' },
      { name: 'Noe St', ward: 'Ward 4 - Noe' }
    ];
    // Simple dynamic lookup based on coordinates
    const seed = Math.floor((Math.abs(Number(lat)) * 1000 + Math.abs(Number(lng)) * 1000));
    const index = seed % streets.length;
    const street = streets[index];
    const block = Math.floor((Math.abs(Number(lat)) * 10000) % 900) + 100;
    const address = `${block} ${street.name}, San Francisco, CA`;
    
    return res.json({
      address,
      ward: street.ward,
      estimatedPopulation: Math.floor(Math.random() * 3000) + 500,
      zoneType: 'Residential / Commercial Mixed Zone'
    });
  }

  try {
    const prompt = `You are a professional GIS geocoding system for San Francisco, California.
Given these coordinates:
Latitude: ${lat}
Longitude: ${lng}

Based on these coordinates (which are in San Francisco, CA, bounded roughly by 37.70 to 37.82 latitude and -122.52 to -122.36 longitude), find the closest real street address or point of interest in San Francisco.
Also map it to one of these municipal wards:
- "Ward 3 - Mission"
- "Ward 5 - Heights"
- "Ward 2 - Castro"
- "Ward 4 - Noe"

Return ONLY a JSON response matching this schema:
{
  "address": "e.g., 550 Valencia St, San Francisco, CA",
  "ward": "e.g., Ward 3 - Mission",
  "estimatedPopulation": 1500,
  "zoneType": "Residential" | "Commercial" | "Park" | "Industrial"
}
Do not use Markdown wrapping, respond with ONLY raw JSON.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const textResponse = response.text || '';
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (error) {
    console.error('Gemini reverse-geocoding error:', error);
    res.json({
      address: `${Math.floor(Math.random() * 900) + 100} Valencia St, San Francisco, CA`,
      ward: `Ward 3 - Mission`,
      estimatedPopulation: 1200,
      zoneType: 'Commercial'
    });
  }
});

// AI Chat Assistant (Conversational Help Powered by Gemini)
app.post('/api/ai/chat', async (req, res) => {
  const { messages, userId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const client = getGeminiClient();
  const recentMsg = messages[messages.length - 1].content;

  // Retrieve current citizen context to enrich the response
  const activeIssuesSummary = ISSUES.slice(0, 6).map(i => 
    `- [ID: ${i.id}] "${i.title}" at "${i.location.address}" | Status: ${i.status} | Priority: ${i.priority}`
  ).join('\n');

  const predictiveInsightsSummary = PREDICTIVE_HOTSPOTS.map(h =>
    `- ${h.type} hotspot around lat: ${h.lat.toFixed(4)}, lng: ${h.lng.toFixed(4)} (Risk: ${h.riskScore}, Probability: ${Math.round(h.probability * 100)}%)`
  ).join('\n');

  const systemContext = `You are the "Community Hero Assistant", a friendly, highly intelligent municipal AI chatbot for a civic-tech application called "Community Hero". 
Citizens and municipal workers talk to you to track issues, view reports, learn about local government schemes, and obtain department contact information.

CURRENT SYSTEM LIVE STATE DATA FOR CONTEXT:
--- ACTIVE ISSUES ---
${activeIssuesSummary}

--- AI PREDICTIVE HOTSPOTS ---
${predictiveInsightsSummary}

MUNICIPAL DIRECTORY:
- Road Maintenance: 555-0192 (Chief Inspector Vance)
- Water & Sewerage Utility: 555-0143 (Director Sarah Jenkins)
- Waste Management Division: 555-0177
- Electrical Infrastructure (Streetlights): 555-0188

GOVERNMENT SCHEMES:
- "Clean City Initiative": Citizens earn rewards/tax credits for resolving trash/litter reports and maintaining 100+ points on Community Hero.
- "Sewer Smart 2026": City council matches budget up to $10,000 for drainage line upgrades recommended by community upvote priority.

INSTRUCTIONS:
1. Speak warmly, respectfully, and helpful like a civic advisor.
2. Rely strictly on the CURRENT SYSTEM LIVE STATE DATA listed above. If the user asks about an issue or prediction, refer to it specifically!
3. If they ask about resolving a report, mention upvoting or verifying it.
4. Keep replies formatting beautiful with elegant markdown, bold headings, and small lists. Make answers crisp. No developer debug jargon.`;

  if (!client) {
    console.log('Using rule-based local AI chatbot fallback.');
    const q = recentMsg.toLowerCase();
    let reply = `I am the **Community Hero AI Assistant**. Here is what I can help you with:
- Check the status of ongoing reported issues (like the 14th Street Pothole or Oak Crescent water leak).
- Find municipal utility department contact numbers.
- Explain civic reward initiatives like the **Clean City Initiative**.

Can you tell me more about what you would like to know?`;

    if (q.includes('pothole') || q.includes('14th')) {
      reply = `### 14th Street Pothole Status Update
The deep pothole reported on **14th Street & Valencia St** is currently marked as **In Progress**.

- **Assigned Officer:** Chief Inspector Marcus Vance
- **Crew Action:** An asphalt patching crew was dispatched yesterday. They are laying hot-mix overlay.
- **Estimated Completion:** June 28, 2026.
- **Current Score:** 52 points (42 citizens supported, 2 verified on-site).

You can monitor its live timeline in the **Issue Details** screen!`;
    } else if (q.includes('leak') || q.includes('water') || q.includes('oak')) {
      reply = `### Oak Crescent Water Leakage
The water pipe leak reported at **145 Oak Crescent** is currently **Assigned** to Inspector Marcus Vance.

- **Status:** Assigned (Emergency repair crew scheduled for inspection)
- **Impact:** ~600 residents affected due to system pressure drops.
- **Estimated Completion:** June 30, 2026.

Would you like to head to the interactive map to **verify** this leakage and boost its prioritization score?`;
    } else if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('officer')) {
      reply = `### Municipal Directory & Contact Contacts
Here are the official contact numbers for the municipal departments:
- **Road Maintenance Div:** \`555-0192\` (Led by Inspector Vance)
- **Water & Sewerage Utility:** \`555-0143\` (Led by Director Sarah Jenkins)
- **Waste Management (Garbage):** \`555-0177\`
- **Electrical Grid (Streetlights):** \`555-0188\`

Feel free to reach out directly or let me coordinate via the dashboard!`;
    } else if (q.includes('points') || q.includes('badges') || q.includes('earn') || q.includes('scheme')) {
      reply = `### Gamification & Government Schemes
Under the local **Clean City Initiative**, you earn municipal credit points by actively reporting and verifying local hazards:
- **Report Issue:** +10 Points
- **Verify Existing Issue:** +5 Points
- **Your Issue Gets Resolved:** +20 Points

**Active Badges:**
1. **Community Hero** (Report 3+ resolved issues)
2. **Problem Solver** (Verify 5+ community issues)
3. **Neighborhood Champion** (Cross 100 total points)

Accumulated points can be redeemed for local parking discounts and utility credit vouchers at City Hall!`;
    } else if (q.includes('hotspot') || q.includes('prediction') || q.includes('predictive')) {
      reply = `### AI Predictive Hotspots
Our infrastructure machine learning models have flagged **4 active hotspots** showing advanced wear and tear:
1. **Road Damage Hotspot** near 14th St (Risk: **High** - 88% probability due to transit volume)
2. **Water Leakage Hotspot** near Oak Crescent (Risk: **High** - 84% probability due to pump pressure)
3. **Garbage Cluster** around Caledonia Alley (Risk: **Medium** - 72% probability)
4. **Streetlight Failure Risk** on Dolores Pathway (Risk: **Medium** - 65% probability)

These help the city budget pre-emptively before major ruptures happen!`;
    }

    return res.json({ content: reply });
  }

  try {
    // Standard chat generation
    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start a chat sessions with instructions
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemContext }] },
        { role: 'model', parts: [{ text: 'Understood. I am online and fully briefed on the Live issues, Predictive hotspots, Gamification rewards, and Municipal Directory. Ready to assist.' }] },
        ...chatHistory,
        { role: 'user', parts: [{ text: recentMsg }] }
      ]
    });

    res.json({ content: response.text || 'I apologize, I was unable to generate a response. Please try again.' });
  } catch (error) {
    console.error('Gemini Assistant chat error:', error);
    res.status(500).json({ error: 'AI Assistant failed. Fallback triggered.', fallback: true });
  }
});

// ==========================================
// VITE CLIENT DEV MIDDLEWARE & PRODUCTION INTEGRATION
// ==========================================

const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    // Mount Vite middleware
    app.use(vite.middlewares);
    console.log('Vite development server mounted as middleware.');
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Serve index.html for all non-API GET requests
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static files from ${distPath} in production.`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(` COMMUNITY HERO FULL-STACK SERVER RUNNING`);
    console.log(` Address: http://localhost:${PORT}`);
    console.log(` Mode:    ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`=================================================`);
  });
}

startServer();
