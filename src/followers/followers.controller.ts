import {
  Controller,
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
}
