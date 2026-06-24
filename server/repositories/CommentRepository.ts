import { COMMENTS, addNotification } from '../db';
import { Comment } from '../../src/types';
import { UserRepository } from './UserRepository';
import { IssueRepository } from './IssueRepository';

export class CommentRepository {
  static getAll(): Comment[] {
    return COMMENTS;
  }

  static getByIssueId(issueId: string): Comment[] {
    return COMMENTS.filter(c => c.issueId === issueId);
  }

  static create(issueId: string, userId: string, content: string, evidencePhoto?: string): Comment | undefined {
    const issue = IssueRepository.findById(issueId);
    if (!issue) return undefined;

    const user = UserRepository.findById(userId);
    if (!user) return undefined;

    const newComment: Comment = {
      id: 'comment_' + Math.random().toString(36).substr(2, 9),
      issueId,
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

    // Notify issue owner
    if (issue.createdBy !== userId) {
      addNotification(
        issue.createdBy,
        'New Comment on Your Report',
        `${user.name} commented on "${issue.title}".`,
        'info',
        issue.id
      );
    }

    return newComment;
  }
}
