import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: { role: string }) {
    return this.paymentsService.create(dto, user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: { role: string },
  ) {
    return this.paymentsService.update(id, dto, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  list(
    @Query('studentId') studentId?: string,
    @CurrentUser() user?: { sub: number; role: string },
  ) {
    const role = user?.role;
    const parsedStudentId = studentId ? Number(studentId) : undefined;
    return this.paymentsService.listForRole({
      role: role!,
      studentId: parsedStudentId,
      parentId: user?.sub,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  my(@CurrentUser() user: { sub: number }) {
    return this.paymentsService.listForRole({ role: 'PARENT', parentId: user.sub });
  }
}

