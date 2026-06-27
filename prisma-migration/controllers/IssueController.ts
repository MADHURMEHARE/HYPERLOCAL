import { Request, Response } from 'express';
import { IssueRepository } from '../repositories/IssueRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { IssueStatus } from '../../src/types';

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

    try {
      const newIssue = await IssueRepository.create({
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
        aiConfidence: aiConfidence ? Number(aiConfidence) : undefined,
        estimatedImpact: estimatedImpact ? Number(estimatedImpact) : undefined
      });
      return res.status(201).json(newIssue);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create issue.' });
    }
  }

  static async vote(req: Request, res: Response) {
    const { userId } = req.body;
    try {
      const result = await IssueRepository.addVote(req.params.id, userId);
      if (!result) {
        return res.status(404).json({ error: 'Issue not found.' });
      }
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit vote.' });
    }
  }

  static async verify(req: Request, res: Response) {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required for verification.' });
    }

    try {
      const result = await IssueRepository.addVerification(req.params.id, userId);
      if (!result) {
        return res.status(404).json({ error: 'Issue not found.' });
      }

      if (!result.success) {
        return res.status(400).json({ error: 'You have already verified this issue.' });
      }

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit verification.' });
    }
  }

  static async comment(req: Request, res: Response) {
    const { userId, content, evidencePhoto } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: 'Missing userId or content.' });
    }

    try {
      const newComment = await CommentRepository.create(req.params.id, userId, content, evidencePhoto);
      if (!newComment) {
        return res.status(404).json({ error: 'Issue or user not found.' });
      }

      return res.status(201).json(newComment);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create comment.' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    const { status, note, officerId, officerName, costEstimate, resolutionTimeline, photoUrl, vendorId, vendorName, allotmentType } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    try {
      const updated = await IssueRepository.updateStatus(req.params.id, {
        status: status as IssueStatus,
        note,
        officerId,
        officerName,
        costEstimate,
        resolutionTimeline,
        photoUrl,
        vendorId,
        vendorName,
        allotmentType
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
    const { role } = req.body;
    try {
      const user = await UserRepository.updateRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const allUsers = await UserRepository.getAll();
      return res.json({ success: true, user, users: allUsers });
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
    const { issueId, userId, content, evidencePhoto } = req.body;
    if (!issueId || !userId || !content) {
      return res.status(400).json({ error: 'Missing issueId, userId, or content.' });
    }

    try {
      const newComment = await CommentRepository.create(issueId, userId, content, evidencePhoto);
      if (!newComment) {
        return res.status(404).json({ error: 'Issue or user not found.' });
      }

      return res.status(201).json(newComment);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create comment.' });
    }
  }
}
