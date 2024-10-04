import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PostDto } from './dto/post/post.dto';
import { CreatePostDto } from './dto/post/create-post.dto';
import { UpdatePostDto } from './dto/post/update-post.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ImgurService } from 'src/imgur/imgur.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private imgurService: ImgurService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
    image: Buffer,
  ): Promise<PostDto> {
    this.logger.log(
      `Start method 'createPost' executed by user with id ${userId}`,
    );
    try {
      const imageUrl = await this.imgurService.uploadImage(image);

      const post = await this.prisma.post.create({
        data: {
          ...createPostDto,
          imageUrl,
          authorId: userId,
        },
      });

      await this.logAction('CREATE_POST', userId, post.id);
      this.logger.log(`Post created successfully by user with id ${userId}`);

      return plainToInstance(PostDto, post, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(
        `Failed to create post by user with id ${userId}: ${error.message}`,
      );

      throw error;
    }
  }

  async getPostById(id: number, userId: number): Promise<PostDto> {
    this.logger.log(
      `Start method 'getPostById' executed by user with id ${userId}`,
    );
    try {
      const post = await this.prisma.post.findUnique({
        where: { id },
        include: {
          likes: {
            select: { userId: true },
          },
          comments: {
            include: {
              user: { select: { id: true, username: true } },
              likes: { select: { userId: true } },
            },
          },
        },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      this.logger.log(
        `User with id ${userId} retrieved post with id ${id} successfully`,
      );
      await this.logAction('VIEW_POST', userId, id);

      return plainToInstance(PostDto, post, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve post with id ${id} for user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async updatePost(
    postId: number,
    userId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDto> {
    this.logger.log(
      `Start method 'updatePost' executed by user with id ${userId}`,
    );
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      if (post.authorId !== userId) {
        throw new ForbiddenException('You are not allowed to edit this post');
      }

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: { ...updatePostDto },
      });

      await this.logAction('UPDATE_POST', userId, postId);
      this.logger.log(
        `Post with id ${postId} updated successfully by user with id ${userId}`,
      );

      return plainToClass(PostDto, updatedPost, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update post with id ${postId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async deletePost(
    postId: number,
    userId: number,
    roleId: number,
  ): Promise<void> {
    this.logger.log(
      `Start method 'deletePost' executed by user with id ${userId}`,
    );
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      if (post.authorId !== userId && roleId !== 1) {
        throw new ForbiddenException('You are not allowed to delete this post');
      }

      await this.prisma.post.delete({
        where: { id: postId },
      });

      await this.logAction('DELETE_POST', userId, postId);
      this.logger.log(
        `Post with id ${postId} deleted successfully by user with id ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete post with id ${postId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getAllPosts(): Promise<PostDto[]> {
    this.logger.log(`Start method 'getAllPosts'`);
    try {
      const posts = await this.prisma.post.findMany({
        include: {
          author: true,
          likes: { select: { userId: true } },
          comments: {
            include: {
              user: { select: { id: true, username: true } },
              likes: { select: { userId: true } },
            },
          },
        },
      });

      this.logger.log(`'getAllPosts' executed successfully`);
      return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(`Failed to get all posts: ${error.message}`);
      throw error;
    }
  }

  async getPostsByAuthor(authorId: number): Promise<PostDto[]> {
    this.logger.log(
      `Start method 'getPostsByAuthor' executed for author with id ${authorId}`,
    );
    try {
      const posts = await this.prisma.post.findMany({
        where: { authorId },
        include: {
          author: true,
          likes: { select: { userId: true } },
          comments: {
            include: {
              user: { select: { id: true, username: true } },
              likes: { select: { userId: true } },
            },
          },
        },
      });

      if (!posts || posts.length === 0) {
        throw new NotFoundException(
          `No posts found for author with ID ${authorId}`,
        );
      }

      this.logger.log(
        `Successfully retrieved posts for author with id ${authorId}`,
      );
      return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve posts for author with id ${authorId}: ${error.message}`,
      );
      throw error;
    }
  }

  async likePost(postId: number, userId: number): Promise<void> {
    this.logger.log(
      `Start method 'likePost' executed by user with id ${userId} for post with id ${postId}`,
    );
    try {
      const existingLike = await this.prisma.postLike.findUnique({
        where: {
          userId_postId: { userId, postId },
        },
      });

      if (existingLike) {
        throw new BadRequestException('User has already liked this post');
      }

      await this.prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      });

      await this.logAction('LIKE_POST', userId, postId);
      this.logger.log(
        `Post with id ${postId} successfully liked by user with id ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to like post with id ${postId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
  async unlikePost(postId: number, userId: number): Promise<void> {
    this.logger.log(
      `Start method 'unlikePost' executed by user with id ${userId} for post with id ${postId}`,
    );
    try {
      const like = await this.prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      if (!like) {
        throw new NotFoundException('Like not found');
      }

      await this.prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      await this.logAction('UNLIKE_POST', userId, postId);
      this.logger.log(
        `Post with id ${postId} successfully unliked by user with id ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to unlike post with id ${postId} by user with id ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
  async logAction(
    action: string,
    userId: number,
    postId?: number,
    commentId?: number,
  ) {
    await this.prisma.actionLog.create({
      data: {
        action,
        userId,
        postId,
        commentId,
        createdAt: new Date(),
      },
    });
    this.logger.log(`Action "${action}" logged for user with id ${userId}`);
  }
}
