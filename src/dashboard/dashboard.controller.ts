import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { DashboardService } from './dashboard.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  summary(@CurrentUser() user: { sub: number; role: string }) {
    if (user.role === 'PARENT' || user.role === 'MERE' || user.role === 'mere') {
      return this.dashboardService.parentSummary(user.sub);
    }
    return this.dashboardService.summary();
  }
}
