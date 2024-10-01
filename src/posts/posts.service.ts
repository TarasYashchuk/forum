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

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private imgurService: ImgurService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
    image: Buffer,
  ): Promise<PostDto> {
    const imageUrl = await this.imgurService.uploadImage(image);

    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        imageUrl,
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

    return plainToInstance(PostDto, post, { excludeExtraneousValues: true });
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

    if (post.authorId !== userId) {
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
        comments: {
          include: {
            user: { select: { id: true, username: true } },
            likes: { select: { userId: true } },
          },
        },
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
