import { prisma, runWithFallback } from '../../prisma/prisma-client';
import { Comment } from '../../src/types';
import { UserRepository } from './UserRepository';
import { IssueRepository } from './IssueRepository';
import { NotificationRepository } from './NotificationRepository';
import { COMMENTS } from '../db';

export class CommentRepository {
  static async getAll(): Promise<Comment[]> {
    return runWithFallback(
      async () => {
        const comments = await prisma!.comment.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return comments.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString()
        }));
      },
      async () => {
        return COMMENTS;
      }
    );
  }

  static async getByIssueId(issueId: string): Promise<Comment[]> {
    return runWithFallback(
      async () => {
        const comments = await prisma!.comment.findMany({
          where: { issueId },
          orderBy: { createdAt: 'asc' }
        });
        return comments.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString()
        }));
      },
      async () => {
        return COMMENTS.filter(c => c.issueId === issueId);
      }
    );
  }

  static async create(issueId: string, userId: string, content: string, evidencePhoto?: string): Promise<Comment | null> {
    const issue = await IssueRepository.findById(issueId);
    if (!issue) return null;

    const user = await UserRepository.findById(userId);
    if (!user) return null;

    const commentId = 'comment_' + Math.random().toString(36).substring(2, 11);

    return runWithFallback(
      async () => {
        const comment = await prisma!.comment.create({
          data: {
            id: commentId,
            issueId,
            userId,
            userName: user.name,
            userAvatar: user.avatar,
            content,
            evidencePhoto,
          }
        });

        // Update comment count on issue
        await prisma!.issue.update({
          where: { id: issueId },
          data: {
            publicCommentsCount: { increment: 1 }
          }
        });

        // Notify issue owner
        if (issue.createdBy !== userId) {
          await NotificationRepository.create(
            issue.createdBy,
            'New Comment on Your Report',
            `${user.name} commented on "${issue.title}".`,
            'info',
            issue.id
          );
        }

        return {
          ...comment,
          createdAt: comment.createdAt.toISOString()
        };
      },
      async () => {
        const newComment: Comment = {
          id: commentId,
          issueId,
          userId,
          userName: user.name,
          userAvatar: user.avatar || undefined,
          content,
          evidencePhoto: evidencePhoto || undefined,
          createdAt: new Date().toISOString()
        };
        COMMENTS.push(newComment);

        // Update comment count in memory
        issue.publicCommentsCount = (issue.publicCommentsCount || 0) + 1;

        // Notify issue owner
        if (issue.createdBy !== userId) {
          await NotificationRepository.create(
            issue.createdBy,
            'New Comment on Your Report',
            `${user.name} commented on "${issue.title}".`,
            'info',
            issue.id
          );
        }

        return newComment;
      }
    );
  }
}
