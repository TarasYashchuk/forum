import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from 'src/common/request-with-user.interface';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('followers')
export class FollowersController {
  constructor(private followerService: FollowersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Post('follow/:userIdToFollow')
  async followUser(
    @Param('userIdToFollow', ParseIntPipe) userIdToFollow: number,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.followerService.followUser(userId, userIdToFollow);
    return { message: 'User followed successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Delete('unfollow/:followingId')
  async unfollowUser(
    @Param('followingId', ParseIntPipe) followingId: number,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const user = req.user as { id: number };

    const result = await this.followerService.unfollowUser(
      user.id,
      followingId,
    );

    if (result.count === 0) {
      throw new NotFoundException(
        `You are not following the user with ID ${followingId}`,
      );
    }

    return { message: 'Successfully unfollowed the user' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get(':userId/followers')
  async getFollowers(@Param('userId', ParseIntPipe) userId: number) {
    return this.followerService.getFollowers(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get(':userId/following')
  async getFollowing(@Param('userId', ParseIntPipe) userId: number) {
    return this.followerService.getFollowing(userId);
  }
}
