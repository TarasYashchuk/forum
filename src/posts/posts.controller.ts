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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostDto } from './dto/post/post.dto';
import { CreatePostDto } from './dto/post/create-post.dto';
import { UpdatePostDto } from './dto/post/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { PostService } from './posts.service';
import { plainToInstance } from 'class-transformer';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RequestWithUser } from 'src/common/request-with-user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create-post')
  @Roles(2, 1)
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: RequestWithUser,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<PostDto> {
    const userId = req.user.id;

    return this.postService.createPost(createPostDto, userId, image.buffer);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Patch(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: RequestWithUser,
  ): Promise<PostDto> {
    const userId = req.user.id;
    return this.postService.updatePost(Number(postId), userId, updatePostDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Delete(':id')
  async deletePost(
    @Param('id') postId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const { id: userId, roleId } = req.user;
    await this.postService.deletePost(Number(postId), userId, roleId);
    return { message: 'Post successfully deleted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get()
  async getAllPosts(): Promise<PostDto[]> {
    return this.postService.getAllPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(1, 2)
  @Get('author/:authorId')
  async getPostsByAuthor(
    @Param('authorId') authorId: string,
  ): Promise<PostDto[]> {
    const posts = await this.postService.getPostsByAuthor(Number(authorId));
    return posts.map((post) =>
      plainToInstance(PostDto, post, { excludeExtraneousValues: true }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Post(':postId/like')
  async likePost(
    @Param('postId') postId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.postService.likePost(Number(postId), userId);
    return { message: 'Post liked successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Delete(':postId/unlike')
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.postService.unlikePost(postId, userId);
    return { message: 'Post unliked successfully' };
  }
}
