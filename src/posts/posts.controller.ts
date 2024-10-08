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
  BadRequestException,
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
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          return callback(
            new BadRequestException('Unsupported file type'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
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
  async getPostById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<PostDto> {
    const userId = req.user.id;
    const roleId = req.user.roleId;

    return this.postService.getPostById(id, userId, roleId);
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
  async getAllPosts(@Req() req: RequestWithUser): Promise<PostDto[]> {
    const { id, roleId } = req.user;
    return this.postService.getAllPosts(id, roleId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get('author/:authorId')
  async getPostsByAuthor(
    @Param('authorId', ParseIntPipe) authorId: number,
    @Req() req: RequestWithUser,
  ): Promise<PostDto[]> {
    const userId = req.user.id;
    const roleId = req.user.roleId;

    const posts = await this.postService.getPostsByAuthor(
      authorId,
      userId,
      roleId,
    );
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Patch(':id/status')
  async changePostStatus(
    @Param('id', ParseIntPipe) postId: number,
    @Body('status') status: string,
    @Req() req: RequestWithUser,
  ): Promise<PostDto> {
    const { id, roleId } = req.user;
    return this.postService.changePostStatus(postId, status, id, roleId);
  }
}
