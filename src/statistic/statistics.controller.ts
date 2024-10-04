import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('global')
  async getGlobalStatistics(): Promise<any> {
    return this.statisticsService.getGlobalActionStatistics();
  }

  @Get('user/:userId')
  async getUserStatistics(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.statisticsService.getUserActionStatistics(userId);
  }

  @Get('action/:actionType')
  async getActionCount(@Param('actionType') actionType: string): Promise<any> {
    const count = await this.statisticsService.getActionCountByType(actionType);
    return { actionType, count };
  }
}
