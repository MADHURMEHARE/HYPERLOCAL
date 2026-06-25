import { ISSUES, USERS, COMMENTS, addNotification } from '../db';
import { Issue, IssuePriority, IssueStatus, ProgressUpdate } from '../../src/types';
import { UserRepository } from './UserRepository';

export function getAutoAllotedVendor(category: string): { id: string; name: string } | undefined {
  if (category === 'Road Damage' || category === 'Broken Streetlight' || category === 'Fallen Tree') {
    return { id: 'user_vendor_repairs', name: 'Rapid Repairs Corp' };
  }
  if (category === 'Water Leakage' || category === 'Drainage Issue') {
    return { id: 'user_vendor_aquaflow', name: 'AquaFlow Utilities Ltd' };
  }
  if (category === 'Garbage Collection' || category === 'Illegal Dumping') {
    return { id: 'user_vendor_ecowaste', name: 'EcoWaste Operators' };
  }
  return undefined;
}

export class IssueRepository {
  static getAll(filters: { category?: string; status?: string; priority?: string; q?: string } = {}): Issue[] {
    let filtered = [...ISSUES];
    const { category, status, priority, q } = filters;

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
      const search = q.toLowerCase();
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(search) || 
        i.description.toLowerCase().includes(search) || 
        i.location.address.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  static findById(id: string): Issue | undefined {
    return ISSUES.find(i => i.id === id);
  }

  static create(issueData: Partial<Issue> & { title: string; description: string; category: string; location: any }): Issue {
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
    } = issueData;

    const issueId = 'issue_' + Math.random().toString(36).substr(2, 9);
    
    // Smart priority calculations
    const sevWeight = severity === 'Critical' ? 4 : severity === 'High' ? 3 : severity === 'Medium' ? 2 : 1;
    const impactWeight = estimatedImpact && Number(estimatedImpact) > 500 ? 3 : estimatedImpact && Number(estimatedImpact) > 100 ? 2 : 1;
    const compositeScore = sevWeight + impactWeight;
    const priority: IssuePriority = compositeScore >= 6 ? 'Critical' : compositeScore >= 4 ? 'High' : compositeScore >= 3 ? 'Medium' : 'Low';

    const autoVendor = getAutoAllotedVendor(category);

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
      verificationScore: 1, 
      priority,
      estimatedImpact: Number(estimatedImpact) || 150,
      assignedVendorId: autoVendor?.id,
      assignedVendorName: autoVendor?.name,
      allotmentType: autoVendor ? 'automatic' : undefined,
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
        },
        ...(autoVendor ? [{
          status: 'Reported' as IssueStatus,
          note: `System automatically allotted work to specialized vendor: ${autoVendor.name}.`,
          updatedBy: 'System AI Allotment',
          updatedAt: new Date().toISOString()
        }] : [])
      ]
    };

    ISSUES.unshift(newIssue);

    // Award points to creator
    if (createdBy) {
      UserRepository.addPoints(createdBy, 10); // Report Issue = 10 pts
    }

    if (autoVendor) {
      addNotification(
        autoVendor.id,
        'Automatic Work Allotment',
        `A new ${category} issue has been automatically allotted to you: "${title}".`,
        'info',
        issueId
      );
    }

    // Notify officers of high-priority reports
    if (priority === 'Critical' || priority === 'High') {
      USERS.filter(u => u.role === 'officer' || u.role === 'admin').forEach(officer => {
        addNotification(
          officer.id, 
          'CRITICAL ISSUE REPORTED', 
          `A new ${priority} priority ${category} has been reported at ${location.address}.`, 
          'alert', 
          issueId
        );
      });
    }

    return newIssue;
  }

  static addVote(issueId: string, userId?: string): { success: boolean; upvotes: number; verificationScore: number } | undefined {
    const issue = this.findById(issueId);
    if (!issue) return undefined;

    issue.upvotes += 1;
    // Recalculate verification score
    issue.verificationScore = issue.upvotes + (issue.verifiedBy.length * 5) + Math.round(issue.aiConfidence / 10);
    issue.updatedAt = new Date().toISOString();

    // Award points to creator
    if (issue.createdBy) {
      UserRepository.addPoints(issue.createdBy, 2); // 2 pts per vote received
    }

    // Notify creator of upvote
    if (userId && userId !== issue.createdBy) {
      const voter = UserRepository.findById(userId);
      addNotification(
        issue.createdBy, 
        'Your Report Gained Support!', 
        `${voter ? voter.name : 'A citizen'} upvoted and endorsed your report of "${issue.title}".`, 
        'info', 
        issue.id
      );
    }

    return {
      success: true,
      upvotes: issue.upvotes,
      verificationScore: issue.verificationScore
    };
  }

  static addVerification(issueId: string, userId: string): { success: boolean; verifiedBy: string[]; verificationScore: number; status: IssueStatus } | undefined {
    const issue = this.findById(issueId);
    if (!issue) return undefined;

    if (issue.verifiedBy.includes(userId)) {
      return {
        success: false,
        verifiedBy: issue.verifiedBy,
        verificationScore: issue.verificationScore,
        status: issue.status
      };
    }

    issue.verifiedBy.push(userId);
    // Recalculate score
    issue.verificationScore = issue.upvotes + (issue.verifiedBy.length * 5) + Math.round(issue.aiConfidence / 10);
    
    // Check if status should promote to Verified
    if (issue.status === 'Reported' && issue.verificationScore >= 15) {
      issue.status = 'Verified';
      issue.progressUpdates.push({
        status: 'Verified',
        note: 'Issue community verification score reached threshold. Promoted to Verified state.',
        updatedBy: 'System Guard',
        updatedAt: new Date().toISOString()
      });

      addNotification(
        issue.createdBy, 
        'Issue Verified!', 
        `Congratulations! Your report of "${issue.title}" has been verified by the community!`, 
        'success', 
        issue.id
      );
    }

    issue.updatedAt = new Date().toISOString();

    // Award points to verifier
    UserRepository.addPoints(userId, 5); // Verify = 5 pts

    // Problem Solver badge check
    const verifiedCount = ISSUES.filter(i => i.verifiedBy.includes(userId)).length;
    const verifier = UserRepository.findById(userId);
    if (verifier && verifiedCount >= 5 && !verifier.badges.includes('Problem Solver')) {
      verifier.badges.push('Problem Solver');
      addNotification(
        userId, 
        'New Badge Earned!', 
        'You unlocked the "Problem Solver" badge for verifying 5+ local reports.', 
        'success'
      );
    }

    return {
      success: true,
      verifiedBy: issue.verifiedBy,
      verificationScore: issue.verificationScore,
      status: issue.status
    };
  }

  static updateStatus(issueId: string, statusData: { status: IssueStatus; note?: string; officerId?: string; officerName?: string; costEstimate?: number; resolutionTimeline?: string; photoUrl?: string; vendorId?: string; vendorName?: string; allotmentType?: 'automatic' | 'manual' }): Issue | undefined {
    const issue = this.findById(issueId);
    if (!issue) return undefined;

    const { status, note, officerId, officerName, costEstimate, resolutionTimeline, photoUrl, vendorId, vendorName, allotmentType } = statusData;

    issue.status = status;
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

    if (vendorId) {
      const oldVendorId = issue.assignedVendorId;
      issue.assignedVendorId = vendorId;
      issue.assignedVendorName = vendorName || 'Contractor';
      issue.allotmentType = allotmentType || 'manual';

      if (oldVendorId !== vendorId) {
        addNotification(
          vendorId,
          'Work Allotment Updated',
          `You have been ${issue.allotmentType} assigned to resolve: "${issue.title}".`,
          'info',
          issue.id
        );

        issue.progressUpdates.push({
          status,
          note: `Work allotted to Vendor: ${issue.assignedVendorName} (${issue.allotmentType === 'automatic' ? 'Automatic System Allocation' : 'Manual Inspector Allocation'}).`,
          updatedBy: officerName || 'Municipal Officer',
          updatedAt: new Date().toISOString()
        });
      }
    }

    const updateEntry: ProgressUpdate = {
      status,
      note: note || `Issue status changed to ${status}.`,
      updatedBy: officerName || 'Municipal Officer',
      updatedAt: new Date().toISOString(),
      photoUrl
    };

    issue.progressUpdates.push(updateEntry);
    issue.updatedAt = new Date().toISOString();

    // Award points on resolution
    if (status === 'Resolved') {
      const creator = UserRepository.findById(issue.createdBy);
      if (creator) {
        UserRepository.addPoints(issue.createdBy, 20); // Resolve = 20 pts
        addNotification(
          issue.createdBy,
          'ISSUE RESOLVED! 🎉',
          `Fantastic news! The issue you reported ("${issue.title}") has been marked as resolved by ${officerName || 'municipal staff'}. You earned 20 XP!`,
          'success',
          issue.id
        );

        const resolvedCount = ISSUES.filter(i => i.createdBy === creator.id && i.status === 'Resolved').length;
        if (resolvedCount >= 3 && !creator.badges.includes('Community Hero')) {
          creator.badges.push('Community Hero');
          addNotification(
            creator.id, 
            'Community Hero Badge!', 
            'Congratulations! You are officially a Community Hero for reporting 3+ successfully resolved issues!', 
            'success'
          );
        }
      }
    } else {
      addNotification(
        issue.createdBy,
        `Issue Status Updated: ${status}`,
        `Your reported issue "${issue.title}" is now "${status}". Update: ${note}`,
        'info',
        issue.id
      );
    }

    return issue;
  }

  static delete(id: string): boolean {
    const index = ISSUES.findIndex(i => i.id === id);
    if (index === -1) return false;
    ISSUES.splice(index, 1);
    return true;
  }
}
