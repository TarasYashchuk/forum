import {
  Controller,
  Delete,
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

@Controller('followers')
export class FollowersController {
  constructor(private followerService: FollowersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('follow/:userIdToFollow')
  async followUser(
    @Param('userIdToFollow', ParseIntPipe) userIdToFollow: number,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.followerService.followUser(userId, userIdToFollow);
    return { message: 'User followed successfully' };
  }

  @UseGuards(JwtAuthGuard)
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
}
