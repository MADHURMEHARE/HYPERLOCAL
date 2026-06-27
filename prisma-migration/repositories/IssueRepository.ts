import { prisma } from '../../prisma/prisma-client';
import { Issue, IssuePriority, IssueStatus, ProgressUpdate, IssueCategory } from '../../src/types';
import { UserRepository } from './UserRepository';
import { NotificationRepository } from './NotificationRepository';
import { EmailService } from '../../server/services/EmailService';

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
  static async getAll(filters: { category?: string; status?: string; priority?: string; q?: string } = {}): Promise<Issue[]> {
    const { category, status, priority, q } = filters;
    
    const whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }
    if (status) {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }
    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } }
      ];
    }

    const issues = await prisma.issue.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return issues.map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      category: i.category as IssueCategory,
      severity: i.severity as 'Critical' | 'High' | 'Medium' | 'Low',
      status: i.status as IssueStatus,
      location: {
        lat: i.lat,
        lng: i.lng,
        address: i.address,
        ward: i.ward || undefined
      },
      imageUrl: i.imageUrl || undefined,
      videoUrl: i.videoUrl || undefined,
      upvotes: i.upvotes,
      verifiedBy: i.verifiedBy,
      aiConfidence: i.aiConfidence,
      verificationScore: i.verificationScore,
      priority: i.priority as IssuePriority,
      estimatedImpact: i.estimatedImpact,
      assignedOfficerId: i.assignedOfficerId || undefined,
      assignedOfficerName: i.assignedOfficerName || undefined,
      assignedVendorId: i.assignedVendorId || undefined,
      assignedVendorName: i.assignedVendorName || undefined,
      allotmentType: (i.allotmentType as 'automatic' | 'manual') || undefined,
      costEstimate: i.costEstimate || undefined,
      resolutionTimeline: i.resolutionTimeline || undefined,
      createdBy: i.createdBy,
      creatorName: i.creatorName,
      creatorAvatar: i.creatorAvatar || undefined,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
      progressUpdates: (i.progressUpdates as any) || [],
      publicCommentsCount: i.publicCommentsCount,
      isDuplicateOf: i.isDuplicateOf || undefined
    }));
  }

  static async findById(id: string): Promise<Issue | null> {
    const i = await prisma.issue.findUnique({
      where: { id }
    });
    if (!i) return null;

    return {
      id: i.id,
      title: i.title,
      description: i.description,
      category: i.category as IssueCategory,
      severity: i.severity as 'Critical' | 'High' | 'Medium' | 'Low',
      status: i.status as IssueStatus,
      location: {
        lat: i.lat,
        lng: i.lng,
        address: i.address,
        ward: i.ward || undefined
      },
      imageUrl: i.imageUrl || undefined,
      videoUrl: i.videoUrl || undefined,
      upvotes: i.upvotes,
      verifiedBy: i.verifiedBy,
      aiConfidence: i.aiConfidence,
      verificationScore: i.verificationScore,
      priority: i.priority as IssuePriority,
      estimatedImpact: i.estimatedImpact,
      assignedOfficerId: i.assignedOfficerId || undefined,
      assignedOfficerName: i.assignedOfficerName || undefined,
      assignedVendorId: i.assignedVendorId || undefined,
      assignedVendorName: i.assignedVendorName || undefined,
      allotmentType: (i.allotmentType as 'automatic' | 'manual') || undefined,
      costEstimate: i.costEstimate || undefined,
      resolutionTimeline: i.resolutionTimeline || undefined,
      createdBy: i.createdBy,
      creatorName: i.creatorName,
      creatorAvatar: i.creatorAvatar || undefined,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
      progressUpdates: (i.progressUpdates as any) || [],
      publicCommentsCount: i.publicCommentsCount,
      isDuplicateOf: i.isDuplicateOf || undefined
    };
  }

  static async create(issueData: Partial<Issue> & { title: string; description: string; category: string; location: any }): Promise<Issue> {
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

    const issueId = 'issue_' + Math.random().toString(36).substring(2, 11);
    
    // Smart priority calculations
    const sevWeight = severity === 'Critical' ? 4 : severity === 'High' ? 3 : severity === 'Medium' ? 2 : 1;
    const impactWeight = estimatedImpact && Number(estimatedImpact) > 500 ? 3 : estimatedImpact && Number(estimatedImpact) > 100 ? 2 : 1;
    const compositeScore = sevWeight + impactWeight;
    const priority: IssuePriority = compositeScore >= 6 ? 'Critical' : compositeScore >= 4 ? 'High' : compositeScore >= 3 ? 'Medium' : 'Low';

    const autoVendor = getAutoAllotedVendor(category);

    const initialProgress: ProgressUpdate[] = [
      {
        status: 'Reported',
        note: `Issue reported by ${creatorName || 'Citizen'}. Severity: ${severity || 'Medium'}. AI initiated impact evaluation.`,
        updatedBy: 'System AI',
        updatedAt: new Date().toISOString()
      }
    ];

    if (autoVendor) {
      initialProgress.push({
        status: 'Reported',
        note: `System automatically allotted work to specialized vendor: ${autoVendor.name}.`,
        updatedBy: 'System AI Allotment',
        updatedAt: new Date().toISOString()
      });
    }

    const created = await prisma.issue.create({
      data: {
        id: issueId,
        title,
        description,
        category,
        severity: severity || 'Medium',
        status: 'Reported',
        lat: Number(location.lat) || 37.7749,
        lng: Number(location.lng) || -122.4194,
        address: location.address || 'Unknown Address',
        ward: location.ward || 'Ward 3 - Mission',
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
        allotmentType: autoVendor ? 'automatic' : null,
        createdBy: createdBy || 'user_alex',
        creatorName: creatorName || 'Alex Mercer',
        creatorAvatar: creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        progressUpdates: initialProgress as any,
        publicCommentsCount: 0
      }
    });

    // Award points to creator and send email notification
    if (createdBy) {
      await UserRepository.addPoints(createdBy, 10); // Report Issue = 10 pts
      UserRepository.findById(createdBy).then((creator) => {
        if (creator && creator.email) {
          EmailService.sendIssueReportedEmail(
            creator.email,
            creator.name,
            title,
            category,
            priority,
            location.address || 'Unknown Address'
          ).catch((err) => console.error('Failed to send issue reported email:', err));
        }
      }).catch((err) => console.error('Failed to find creator for email notification:', err));
    }

    if (autoVendor) {
      await NotificationRepository.create(
        autoVendor.id,
        'Automatic Work Allotment',
        `A new ${category} issue has been automatically allotted to you: "${title}".`,
        'info',
        issueId
      );
    }

    // Notify officers of high-priority reports
    if (priority === 'Critical' || priority === 'High') {
      const staff = await prisma.user.findMany({
        where: { role: { in: ['officer', 'admin'] } }
      });
      for (const officer of staff) {
        await NotificationRepository.create(
          officer.id, 
          'CRITICAL ISSUE REPORTED', 
          `A new ${priority} priority ${category} has been reported at ${location.address}.`, 
          'alert', 
          issueId
        );
      }
    }

    return {
      id: created.id,
      title: created.title,
      description: created.description,
      category: created.category as IssueCategory,
      severity: created.severity as 'Critical' | 'High' | 'Medium' | 'Low',
      status: created.status as IssueStatus,
      location: {
        lat: created.lat,
        lng: created.lng,
        address: created.address,
        ward: created.ward || undefined
      },
      imageUrl: created.imageUrl || undefined,
      videoUrl: created.videoUrl || undefined,
      upvotes: created.upvotes,
      verifiedBy: created.verifiedBy,
      aiConfidence: created.aiConfidence,
      verificationScore: created.verificationScore,
      priority: created.priority as IssuePriority,
      estimatedImpact: created.estimatedImpact,
      assignedOfficerId: created.assignedOfficerId || undefined,
      assignedOfficerName: created.assignedOfficerName || undefined,
      assignedVendorId: created.assignedVendorId || undefined,
      assignedVendorName: created.assignedVendorName || undefined,
      allotmentType: (created.allotmentType as 'automatic' | 'manual') || undefined,
      costEstimate: created.costEstimate || undefined,
      resolutionTimeline: created.resolutionTimeline || undefined,
      createdBy: created.createdBy,
      creatorName: created.creatorName,
      creatorAvatar: created.creatorAvatar || undefined,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      progressUpdates: (created.progressUpdates as any) || [],
      publicCommentsCount: created.publicCommentsCount,
      isDuplicateOf: created.isDuplicateOf || undefined
    };
  }

  static async addVote(issueId: string, userId?: string): Promise<{ success: boolean; upvotes: number; verificationScore: number } | null> {
    const issue = await this.findById(issueId);
    if (!issue) return null;

    const newUpvotes = issue.upvotes + 1;
    const newScore = newUpvotes + (issue.verifiedBy.length * 5) + Math.round(issue.aiConfidence / 10);

    await prisma.issue.update({
      where: { id: issueId },
      data: {
        upvotes: newUpvotes,
        verificationScore: newScore
      }
    });

    // Award points to creator
    if (issue.createdBy) {
      await UserRepository.addPoints(issue.createdBy, 2); // 2 pts per vote received
    }

    // Notify creator of upvote
    if (userId && userId !== issue.createdBy) {
      const voter = await UserRepository.findById(userId);
      await NotificationRepository.create(
        issue.createdBy, 
        'Your Report Gained Support!', 
        `${voter ? voter.name : 'A citizen'} upvoted and endorsed your report of "${issue.title}".`, 
        'info', 
        issue.id
      );
    }

    return {
      success: true,
      upvotes: newUpvotes,
      verificationScore: newScore
    };
  }

  static async addVerification(issueId: string, userId: string): Promise<{ success: boolean; verifiedBy: string[]; verificationScore: number; status: IssueStatus } | null> {
    const issue = await this.findById(issueId);
    if (!issue) return null;

    if (issue.verifiedBy.includes(userId)) {
      return {
        success: false,
        verifiedBy: issue.verifiedBy,
        verificationScore: issue.verificationScore,
        status: issue.status
      };
    }

    const newVerifiedBy = [...issue.verifiedBy, userId];
    const newScore = issue.upvotes + (newVerifiedBy.length * 5) + Math.round(issue.aiConfidence / 10);
    
    let newStatus = issue.status;
    const updates = [...issue.progressUpdates];

    if (issue.status === 'Reported' && newScore >= 15) {
      newStatus = 'Verified';
      updates.push({
        status: 'Verified',
        note: 'Issue community verification score reached threshold. Promoted to Verified state.',
        updatedBy: 'System Guard',
        updatedAt: new Date().toISOString()
      });

      await NotificationRepository.create(
        issue.createdBy, 
        'Issue Verified!', 
        `Congratulations! Your report of "${issue.title}" has been verified by the community!`, 
        'success', 
        issue.id
      );

      // Send verification status change email asynchronously
      const creator = await UserRepository.findById(issue.createdBy);
      if (creator && creator.email) {
        EmailService.sendIssueStatusUpdateEmail(
          creator.email,
          creator.name,
          issue.title,
          issue.status,
          newStatus,
          'Issue community verification score reached threshold. Promoted to Verified state.'
        ).catch((err) => console.error('Failed to send status update email:', err));
      }
    }

    await prisma.issue.update({
      where: { id: issueId },
      data: {
        verifiedBy: newVerifiedBy,
        verificationScore: newScore,
        status: newStatus,
        progressUpdates: updates as any
      }
    });

    // Award points to verifier
    await UserRepository.addPoints(userId, 5); // Verify = 5 pts

    // Problem Solver badge check
    const verifiedCount = (await prisma.issue.findMany({
      where: { verifiedBy: { has: userId } }
    })).length;
    const verifier = await UserRepository.findById(userId);
    if (verifier && verifiedCount >= 5 && !verifier.badges.includes('Problem Solver')) {
      const newBadges = [...verifier.badges, 'Problem Solver'];
      await prisma.user.update({
        where: { id: userId },
        data: { badges: newBadges }
      });
      await NotificationRepository.create(
        userId, 
        'New Badge Earned!', 
        'You unlocked the "Problem Solver" badge for verifying 5+ local reports.', 
        'success'
      );
    }

    return {
      success: true,
      verifiedBy: newVerifiedBy,
      verificationScore: newScore,
      status: newStatus as IssueStatus
    };
  }

  static async updateStatus(issueId: string, statusData: { status: IssueStatus; note?: string; officerId?: string; officerName?: string; costEstimate?: number; resolutionTimeline?: string; photoUrl?: string; vendorId?: string; vendorName?: string; allotmentType?: 'automatic' | 'manual' }): Promise<Issue | null> {
    const issue = await this.findById(issueId);
    if (!issue) return null;

    const { status, note, officerId, officerName, costEstimate, resolutionTimeline, photoUrl, vendorId, vendorName, allotmentType } = statusData;

    const updateFields: any = {
      status,
    };

    if (officerId) {
      updateFields.assignedOfficerId = officerId;
      updateFields.assignedOfficerName = officerName || 'Municipal Officer';
    }
    if (costEstimate !== undefined) {
      updateFields.costEstimate = Number(costEstimate);
    }
    if (resolutionTimeline) {
      updateFields.resolutionTimeline = resolutionTimeline;
    }

    const updates = [...issue.progressUpdates];

    if (vendorId) {
      const oldVendorId = issue.assignedVendorId;
      updateFields.assignedVendorId = vendorId;
      updateFields.assignedVendorName = vendorName || 'Contractor';
      updateFields.allotmentType = allotmentType || 'manual';

      if (oldVendorId !== vendorId) {
        await NotificationRepository.create(
          vendorId,
          'Work Allotment Updated',
          `You have been ${updateFields.allotmentType} assigned to resolve: "${issue.title}".`,
          'info',
          issue.id
        );

        updates.push({
          status,
          note: `Work allotted to Vendor: ${updateFields.assignedVendorName} (${updateFields.allotmentType === 'automatic' ? 'Automatic System Allocation' : 'Manual Inspector Allocation'}).`,
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

    updates.push(updateEntry);
    updateFields.progressUpdates = updates as any;

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: updateFields
    });

    // Award points on resolution
    if (status === 'Resolved') {
      const creator = await UserRepository.findById(issue.createdBy);
      if (creator) {
        await UserRepository.addPoints(issue.createdBy, 20); // Resolve = 20 pts
        await NotificationRepository.create(
          issue.createdBy,
          'ISSUE RESOLVED! 🎉',
          `Fantastic news! The issue you reported ("${issue.title}") has been marked as resolved by ${officerName || 'municipal staff'}. You earned 20 XP!`,
          'success',
          issue.id
        );

        const resolvedCount = (await prisma.issue.findMany({
          where: { createdBy: creator.id, status: 'Resolved' }
        })).length;
        if (resolvedCount >= 3 && !creator.badges.includes('Community Hero')) {
          const newBadges = [...creator.badges, 'Community Hero'];
          await prisma.user.update({
            where: { id: creator.id },
            data: { badges: newBadges }
          });
          await NotificationRepository.create(
            creator.id, 
            'Community Hero Badge!', 
            'Congratulations! You are officially a Community Hero for reporting 3+ successfully resolved issues!', 
            'success'
          );
        }
      }
    } else {
      await NotificationRepository.create(
        issue.createdBy,
        `Issue Status Updated: ${status}`,
        `Your reported issue "${issue.title}" is now "${status}". Update: ${note}`,
        'info',
        issue.id
      );
    }

    // Send status update email asynchronously
    const creator = await UserRepository.findById(issue.createdBy);
    if (creator && creator.email) {
      EmailService.sendIssueStatusUpdateEmail(
        creator.email,
        creator.name,
        issue.title,
        issue.status,
        status,
        note || (status === 'Resolved' ? `The issue has been marked as resolved by ${officerName || 'municipal staff'}.` : `The issue status is now ${status}.`)
      ).catch((err) => console.error('Failed to send status update email:', err));
    }

    return this.findById(issueId);
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.issue.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
