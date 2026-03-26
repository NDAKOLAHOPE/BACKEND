import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { MessagesService } from './messages.service.js';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  list(
    @Query('studentId') studentId?: string,
    @CurrentUser() user?: { sub: number; role: string },
  ) {
    const parsedStudentId = studentId ? Number(studentId) : undefined;
    return this.messagesService.listForRole({
      role: user!.role,
      studentId: parsedStudentId,
      parentId: user!.sub,
    });
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  recent(@CurrentUser() user: { sub: number; role: string }) {
    return this.messagesService.listForRole({
      role: user.role,
      parentId: user.sub,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  create(
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    return this.messagesService.create(dto, user.role, user.sub);
  }
}

