import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PostDto } from './dto/post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<PostDto> {
    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: userId,
      },
    });
    return plainToInstance(PostDto, post, { excludeExtraneousValues: true });
  }

  async getPostById(id: number): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return plainToInstance(PostDto, post);
  }

  async updatePost(
    postId: number,
    userId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDto> {
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

    return plainToClass(PostDto, updatedPost, {
      excludeExtraneousValues: true,
    });
  }

  async deletePost(
    postId: number,
    userId: number,
    roleId: number,
  ): Promise<void> {
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
  }

  async getAllPosts(): Promise<PostDto[]> {
    const posts = await this.prisma.post.findMany({
      include: {
        author: true,
        likes: { select: { userId: true } },
      },
    });

    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async getPostsByAuthor(authorId: number): Promise<PostDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      include: {
        author: true,
        likes: { select: { userId: true } },
      },
    });

    if (!posts || posts.length === 0) {
      throw new NotFoundException(
        `No posts found for author with ID ${authorId}`,
      );
    }

    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async likePost(postId: number, userId: number): Promise<void> {
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
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
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
  }
}
