import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createComment(postId: number, userId: number, content: string) {
    const methodName = this.createComment.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${userId}`,
    );
    this.logger.log(
      `User with id ${userId} is creating a comment on post with id ${postId} with content: "${content}"`,
    );
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new Error(`Post with ID ${postId} not found`);
      }

      const comment = await this.prisma.comment.create({
        data: {
          content,
          userId,
          postId,
        },
      });

      await this.logger.logAction('CREATE_COMMENT', userId, postId, comment.id);
      this.logger.log(
        `Comment created by user with id ${userId} on post with id ${postId}: "${content}"`,
      );
      return comment;
    } catch (error) {
      this.logger.error(
        `Failed to create comment by user with id ${userId} on post with id ${postId}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteComment(
    commentId: number,
    userId: number,
    roleId: number,
  ): Promise<void> {
    const methodName = this.deleteComment.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${userId}`,
    );
    this.logger.log(
      `User with id ${userId} is attempting to delete comment ${commentId}`,
    );
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      if (comment.userId !== userId && roleId !== 1) {
        throw new ForbiddenException(
          'You are not allowed to delete this comment',
        );
      }

      await this.prisma.comment.delete({
        where: { id: commentId },
      });

      await this.logger.logAction(
        'DELETE_COMMENT',
        userId,
        comment.postId,
        commentId,
      );
      this.logger.log(
        `Comment with id ${commentId} deleted by user with id ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete comment with id ${commentId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getCommentsByPost(postId: number) {
    const methodName = this.getCommentsByPost.name;
    this.logger.log(`Start method ${methodName} executed`);
    this.logger.log(`Fetching comments for post ${postId}`);
    try {
      const comments = await this.prisma.comment.findMany({
        where: { postId },
        include: {
          user: { select: { id: true, username: true } },
          likes: { select: { userId: true } },
        },
      });

      this.logger.log(
        `Successfully fetched comments for post with id ${postId}: ${comments.length} comments found`,
      );
      return comments;
    } catch (error) {
      this.logger.error(
        `Failed to fetch comments for post with id ${postId}: ${error.message}`,
      );
      throw error;
    }
  }

  async likeComment(commentId: number, userId: number): Promise<void> {
    const methodName = this.likeComment.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${userId}`,
    );
    this.logger.log(
      `User with id ${userId} is attempting to like comment with id ${commentId}`,
    );
    try {
      const existingLike = await this.prisma.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      if (existingLike) {
        throw new BadRequestException('You have already liked this comment');
      }

      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });

      await this.logger.logAction('LIKE_COMMENT', userId, undefined, commentId);
      this.logger.log(
        `Comment with id ${commentId} liked by user with id ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to like comment with id ${commentId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async unlikeComment(commentId: number, userId: number): Promise<void> {
    const methodName = this.unlikeComment.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${userId}`,
    );
    this.logger.log(
      `User with id ${userId} is attempting to unlike comment with id ${commentId}`,
    );
    try {
      const existingLike = await this.prisma.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      if (!existingLike) {
        throw new BadRequestException('You have not liked this comment yet');
      }

      await this.prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      await this.logger.logAction(
        'UNLIKE_COMMENT',
        userId,
        undefined,
        commentId,
      );
      this.logger.log(
        `Comment with id ${commentId} unliked by user with id ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to unlike comment with id ${commentId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async updateComment(commentId: number, userId: number, content: string) {
    const methodName = this.updateComment.name;
    this.logger.log(
      `Start method ${methodName} executed by user with id ${userId}`,
    );
    this.logger.log(
      `User with id ${userId} is attempting to update comment with id ${commentId} with content: "${content}"`,
    );
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new ForbiddenException('You can only edit your own comments');
      }

      const updatedComment = await this.prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });

      await this.logger.logAction(
        'UPDATE_COMMENT',
        userId,
        undefined,
        commentId,
      );
      this.logger.log(
        `Comment with id ${commentId} updated by user with id ${userId} with content: "${content}"`,
      );
      return updatedComment;
    } catch (error) {
      this.logger.error(
        `Failed to update comment with id ${commentId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
}
