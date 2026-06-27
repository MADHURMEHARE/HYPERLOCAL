import { Request, Response } from 'express';
import { IssueRepository } from '../repositories/IssueRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { IssueStatus } from '../../src/types';
import { getLeaderboardHelper } from './AiController';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class IssueController {
  static async getAll(req: Request, res: Response) {
    const { category, status, priority, q } = req.query;
    const filters = {
      category: category ? String(category) : undefined,
      status: status ? String(status) : undefined,
      priority: priority ? String(priority) : undefined,
      q: q ? String(q) : undefined
    };
    try {
      const issues = await IssueRepository.getAll(filters);
      return res.json(issues);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve issues.' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const issue = await IssueRepository.findById(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found.' });
      }
      const comments = await CommentRepository.getByIssueId(issue.id);
      return res.json({ issue, comments });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve issue details.' });
    }
  }

  static async create(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    const { 
      title, 
      description, 
      category, 
      severity, 
      location, 
      imageUrl, 
      videoUrl, 
      aiConfidence,
      estimatedImpact
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Missing required issue properties.' });
    }

    try {
      const dbUser = await UserRepository.findById(user.id);
      const creatorName = dbUser ? dbUser.name : user.email.split('@')[0];
      const creatorAvatar = dbUser ? dbUser.avatar : '';

      const newIssue = await IssueRepository.create({
        title,
        description,
        category,
        severity,
        location,
        imageUrl,
        videoUrl,
        createdBy: user.id,
        creatorName,
        creatorAvatar,
        aiConfidence: aiConfidence ? Number(aiConfidence) : undefined,
        estimatedImpact: estimatedImpact ? Number(estimatedImpact) : undefined
      });

      const allIssues = await IssueRepository.getAll();
      const allUsers = await UserRepository.getAll();
      const leaderboard = await getLeaderboardHelper();

      return res.status(201).json({
        success: true,
        issue: newIssue,
        issues: allIssues,
        users: allUsers,
        leaderboard
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create issue.' });
    }
  }

  static async vote(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    try {
      const result = await IssueRepository.addVote(req.params.id, user.id);
      if (!result) {
        return res.status(404).json({ error: 'Issue not found.' });
      }
      const allIssues = await IssueRepository.getAll();
      return res.json({
        success: true,
        ...result,
        issues: allIssues
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit vote.' });
    }
  }

  static async verify(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    try {
      const result = await IssueRepository.addVerification(req.params.id, user.id);
      if (!result) {
        return res.status(404).json({ error: 'Issue not found.' });
      }

      if (!result.success) {
        return res.status(400).json({ error: 'You have already verified this issue.' });
      }

      const allIssues = await IssueRepository.getAll();
      const allUsers = await UserRepository.getAll();
      const leaderboard = await getLeaderboardHelper();

      return res.json({
        success: true,
        ...result,
        issues: allIssues,
        users: allUsers,
        leaderboard
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit verification.' });
    }
  }

  static async comment(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    const { content, evidencePhoto } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Missing content.' });
    }

    try {
      const newComment = await CommentRepository.create(req.params.id, user.id, content, evidencePhoto);
      if (!newComment) {
        return res.status(404).json({ error: 'Issue or user not found.' });
      }

      return res.status(201).json(newComment);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create comment.' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    const { status, note, officerId, officerName, costEstimate, resolutionTimeline, photoUrl, vendorId, vendorName, allotmentType } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    try {
      const issue = await IssueRepository.findById(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found.' });
      }

      // --- ROW-LEVEL SECURITY / AUTHORITY CONTROLS ---
      if (user.role === 'citizen') {
        return res.status(403).json({ error: 'Access denied. Citizens do not have authority to alter issue statuses.' });
      }

      if (user.role === 'vendor') {
        // Vendors can ONLY update issues assigned to them
        if (issue.assignedVendorId !== user.id) {
          return res.status(403).json({ error: 'Access denied. You are only authorized to update issues assigned to you.' });
        }
        // Vendors can ONLY advance to "In Progress" or "Resolved"
        if (status !== 'In Progress' && status !== 'Resolved') {
          return res.status(403).json({ error: 'Access denied. Contractors/Vendors are restricted to marking issues "In Progress" or "Resolved".' });
        }
        // Vendors are NOT allowed to override budgets, schedule timeline, or reassign vendors
        if (
          (costEstimate !== undefined && Number(costEstimate) !== (issue.costEstimate || 0)) ||
          (resolutionTimeline !== undefined && resolutionTimeline !== (issue.resolutionTimeline || '')) ||
          (vendorId !== undefined && vendorId !== (issue.assignedVendorId || ''))
        ) {
          return res.status(403).json({ error: 'Access denied. Vendors are not permitted to alter budget audits, schedule targets, or assignment parameters.' });
        }
      }

      const updated = await IssueRepository.updateStatus(req.params.id, {
        status: status as IssueStatus,
        note,
        officerId: user.role === 'officer' || user.role === 'admin' ? officerId : undefined,
        officerName: user.role === 'officer' || user.role === 'admin' ? officerName : undefined,
        costEstimate: user.role === 'officer' || user.role === 'admin' ? costEstimate : undefined,
        resolutionTimeline: user.role === 'officer' || user.role === 'admin' ? resolutionTimeline : undefined,
        photoUrl,
        vendorId: user.role === 'officer' || user.role === 'admin' ? vendorId : undefined,
        vendorName: user.role === 'officer' || user.role === 'admin' ? vendorName : undefined,
        allotmentType: user.role === 'officer' || user.role === 'admin' ? allotmentType : undefined
      });

      if (!updated) {
        return res.status(404).json({ error: 'Issue not found.' });
      }

      const allIssues = await IssueRepository.getAll();
      return res.json({ success: true, issue: updated, issues: allIssues });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update issue status.' });
    }
  }

  static async delete(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    if (user.role !== 'admin' && user.role !== 'officer') {
      return res.status(403).json({ error: 'Access denied. Only officers or administrators can delete issues.' });
    }

    try {
      const success = await IssueRepository.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Issue not found.' });
      }
      const allIssues = await IssueRepository.getAll();
      return res.json({ success: true, issues: allIssues });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete issue.' });
    }
  }

  static async changeUserRole(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only administrators have authority to alter clearance roles.' });
    }

    const { role } = req.body;
    try {
      const updatedUser = await UserRepository.updateRole(req.params.id, role);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const allUsers = await UserRepository.getAll();
      return res.json({ success: true, user: updatedUser, users: allUsers });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to change user role.' });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const allUsers = await UserRepository.getAll();
      return res.json(allUsers);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve users.' });
    }
  }

  static async getComments(req: Request, res: Response) {
    try {
      const allComments = await CommentRepository.getAll();
      return res.json(allComments);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve comments.' });
    }
  }

  static async createCommentDirect(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. Valid security token required.' });
    }

    let { issueId, content, evidencePhoto } = req.body;
    
    // Support nested comment payload sent by client
    if (req.body.comment) {
      issueId = req.body.comment.issueId || issueId;
      content = req.body.comment.content || content;
      evidencePhoto = req.body.comment.evidencePhoto || evidencePhoto;
    }

    if (!issueId || !content) {
      return res.status(400).json({ error: 'Missing issueId or content.' });
    }

    try {
      const newComment = await CommentRepository.create(issueId, user.id, content, evidencePhoto);
      if (!newComment) {
        return res.status(404).json({ error: 'Issue or user not found.' });
      }

      const allComments = await CommentRepository.getAll();
      return res.status(201).json({
        success: true,
        comment: newComment,
        comments: allComments
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create comment.' });
    }
  }
}
