import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PostDto } from './dto/post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { plainToInstance } from 'class-transformer';

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

  async getPostById(postId: number): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return plainToInstance(PostDto, post, { excludeExtraneousValues: true });
  }
}
