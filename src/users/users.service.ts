import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../db/entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import type { Role } from '../common/constants/roles.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(
    dto: CreateUserDto,
  ): Promise<{ id: number; email: string; role: Role }> {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      password: passwordHash,
      role: dto.role,
    });

    const saved = await this.usersRepo.save(user);
    return { id: saved.id, email: saved.email, role: saved.role };
  }

  async findAll(): Promise<{ id: number; email: string; role: Role }[]> {
    const users = await this.usersRepo.find();
    const roleMapping: Record<string, Role> = {
      MERE: 'PARENT',
      mere: 'PARENT',
      parent: 'PARENT',
    };
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      role: roleMapping[u.role] ?? u.role,
    }));
  }
}
