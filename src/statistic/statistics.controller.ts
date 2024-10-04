import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

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
}
