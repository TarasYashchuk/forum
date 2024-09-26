import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { PostService } from './posts.service';
import { plainToInstance } from 'class-transformer';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-post')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request,
  ): Promise<PostDto> {
    const user = (req as any).user as {
      id: number;
      username: string;
      roleId: number;
    };
    const userId = user.id;

    return this.postService.createPost(createPostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: Request,
  ): Promise<PostDto> {
    const user = (req as any).user as {
      id: number;
      username: string;
      roleId: number;
    };
    return this.postService.updatePost(Number(postId), user.id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(
    @Param('id') postId: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user as { id: number; roleId: number };
    await this.postService.deletePost(Number(postId), user.id, user.roleId);
    return { message: 'Post successfully deleted' };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPosts(): Promise<PostDto[]> {
    return this.postService.getAllPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('author/:authorId')
  async getPostsByAuthor(
    @Param('authorId') authorId: string,
  ): Promise<PostDto[]> {
    const posts = await this.postService.getPostsByAuthor(Number(authorId));
    return posts.map((post) =>
      plainToInstance(PostDto, post, { excludeExtraneousValues: true }),
    );
  }
}
