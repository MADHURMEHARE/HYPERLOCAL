import { Request, Response } from 'express';
import { IssueRepository } from '../repositories/IssueRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { IssueStatus } from '../../src/types';

export class IssueController {
  static getAll(req: Request, res: Response) {
    const { category, status, priority, q } = req.query;
    const filters = {
      category: category ? String(category) : undefined,
      status: status ? String(status) : undefined,
      priority: priority ? String(priority) : undefined,
      q: q ? String(q) : undefined
    };
    const issues = IssueRepository.getAll(filters);
    return res.json(issues);
  }

  static getById(req: Request, res: Response) {
    const issue = IssueRepository.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }
    const comments = CommentRepository.getByIssueId(issue.id);
    return res.json({ issue, comments });
  }

  static create(req: Request, res: Response) {
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
      const newIssue = IssueRepository.create({
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
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create issue.' });
    }
  }

  static vote(req: Request, res: Response) {
    const { userId } = req.body;
    const result = IssueRepository.addVote(req.params.id, userId);
    if (!result) {
      return res.status(404).json({ error: 'Issue not found.' });
    }
    return res.json(result);
  }

  static verify(req: Request, res: Response) {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required for verification.' });
    }

    const result = IssueRepository.addVerification(req.params.id, userId);
    if (!result) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    if (!result.success) {
      return res.status(400).json({ error: 'You have already verified this issue.' });
    }

    return res.json(result);
  }

  static comment(req: Request, res: Response) {
    const { userId, content, evidencePhoto } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: 'Missing userId or content.' });
    }

    const newComment = CommentRepository.create(req.params.id, userId, content, evidencePhoto);
    if (!newComment) {
      return res.status(404).json({ error: 'Issue or user not found.' });
    }

    return res.status(201).json(newComment);
  }

  static updateStatus(req: Request, res: Response) {
    const { status, note, officerId, officerName, costEstimate, resolutionTimeline, photoUrl } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const updated = IssueRepository.updateStatus(req.params.id, {
      status: status as IssueStatus,
      note,
      officerId,
      officerName,
      costEstimate,
      resolutionTimeline,
      photoUrl
    });

    if (!updated) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    return res.json({ success: true, issue: updated, issues: IssueRepository.getAll() });
  }

  static delete(req: Request, res: Response) {
    const success = IssueRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Issue not found.' });
    }
    return res.json({ success: true, issues: IssueRepository.getAll() });
  }

  static changeUserRole(req: Request, res: Response) {
    const { role } = req.body;
    const user = UserRepository.updateRole(req.params.id, role);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ success: true, user, users: UserRepository.getAll() });
  }

  static getUsers(req: Request, res: Response) {
    return res.json(UserRepository.getAll());
  }

  static getComments(req: Request, res: Response) {
    return res.json(CommentRepository.getAll());
  }

  static createCommentDirect(req: Request, res: Response) {
    const { issueId, userId, content, evidencePhoto } = req.body;
    if (!issueId || !userId || !content) {
      return res.status(400).json({ error: 'Missing issueId, userId, or content.' });
    }

    const newComment = CommentRepository.create(issueId, userId, content, evidencePhoto);
    if (!newComment) {
      return res.status(404).json({ error: 'Issue or user not found.' });
    }

    return res.status(201).json(newComment);
  }
}
