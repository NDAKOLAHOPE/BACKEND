import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { User } from '../db/entities/user.entity.js';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { sub: number }) {
    const found = await this.usersRepo.findOne({ where: { id: user.sub } });
    if (!found) return null;
    return { id: found.id, email: found.email, role: found.role };
  }
}

