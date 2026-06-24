/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  badges: string[];
  ward?: string;
  state?: string;
  avatar?: string;
  createdAt: string;
  passwordHash?: string;
}

export type IssueStatus = 'Reported' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type IssuePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type IssueCategory = 'Road Damage' | 'Water Leakage' | 'Garbage Collection' | 'Broken Streetlight' | 'Drainage Issue' | 'Public Safety' | 'Illegal Dumping' | 'Fallen Tree' | 'Other';

export interface IssueLocation {
  lat: number;
  lng: number;
  address: string;
  ward?: string;
}

export interface ProgressUpdate {
  status: IssueStatus;
  note: string;
  updatedBy: string;
  updatedAt: string;
  photoUrl?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: IssueStatus;
  location: IssueLocation;
  imageUrl?: string;
  videoUrl?: string;
  upvotes: number;
  verifiedBy: string[]; // List of user IDs
  aiConfidence: number; // Percentage e.g. 85
  verificationScore: number;
  priority: IssuePriority;
  estimatedImpact: number; // Estimated number of residents affected
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  costEstimate?: number; // Estimated cost in USD
  resolutionTimeline?: string; // Estimated completion date
  createdBy: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  progressUpdates: ProgressUpdate[];
  publicCommentsCount: number;
  isDuplicateOf?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  evidencePhoto?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  badgesCount: number;
  ward: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  issueId?: string;
  createdAt: string;
}

export interface PredictiveHotspot {
  id: string;
  lat: number;
  lng: number;
  type: IssueCategory;
  riskScore: 'High' | 'Medium' | 'Low';
  probability: number; // e.g. 0.88
  reason: string;
  historicalIncidents: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}
