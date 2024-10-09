import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RequestWithUser } from 'src/common/request-with-user.interface';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('global')
  async getGlobalStatistics(): Promise<any> {
    return this.statisticsService.getGlobalActionStatistics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('user/:userId')
  async getUserStatistics(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.statisticsService.getUserActionStatistics(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('action/:actionType')
  async getActionCount(@Param('actionType') actionType: string): Promise<any> {
    const count = await this.statisticsService.getActionCountByType(actionType);
    return { actionType, count };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get('combined')
  async getStatisticsByPeriod(
    @Query('actions') actions: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval: 'day' | 'week' | 'month',
    @Req() req: RequestWithUser,
  ): Promise<any> {
    const { id: userId, roleId } = req.user;

    const actionsArray = actions.split(',');

    const userIdQuery = roleId === 1 ? req.query.userId : userId;
    if (!actions || !startDate || !endDate || !interval) {
      throw new BadRequestException(
        'Actions, startDate, endDate, and interval are required',
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.statisticsService.getStatisticsByPeriod(
      Number(userIdQuery),
      actionsArray,
      start,
      end,
      interval,
    );
  }
}
