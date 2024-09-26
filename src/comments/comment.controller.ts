import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Post(':postId')
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user as { id: number };
    return this.commentService.createComment(
      postId,
      user.id,
      createCommentDto.content,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user as { id: number };
    await this.commentService.deleteComment(commentId, user.id);
    return { message: 'Comment successfully deleted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get(':postId')
  async getCommentsByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.getCommentsByPost(postId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Post(':commentId/like')
  async likeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user as { id: number };
    await this.commentService.likeComment(commentId, user.id);
    return { message: 'Comment liked' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Delete(':commentId/unlike')
  async unlikeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user as { id: number };
    await this.commentService.unlikeComment(commentId, user.id);
    return { message: 'Comment unliked' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Patch(':commentId')
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user as { id: number };
    return this.commentService.updateComment(
      commentId,
      user.id,
      updateCommentDto.content,
    );
  }
}
