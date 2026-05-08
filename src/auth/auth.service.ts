import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { User } from '../db/entities/user.entity.js';
import type { Role } from '../common/constants/roles.js';

type JwtPayload = { sub: number; role: Role; email?: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ id: number; email: string; role: Role }> {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    if (dto.role === 'ADMIN') {
      const requiredKey = process.env.ADMIN_CREATE_KEY;
      // En dev, si aucune clé n'est fournie, on autorise l'inscription admin pour faciliter les tests.
      if (requiredKey) {
        if (!dto.adminKey || dto.adminKey !== requiredKey) {
          throw new UnauthorizedException('Invalid admin key');
        }
      } else if (process.env.NODE_ENV !== 'development') {
        throw new BadRequestException('Admin registration is disabled');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      password: passwordHash,
      role: dto.role,
    });

    const saved = await this.usersRepo.save(user);
    return { id: saved.id, email: saved.email, role: saved.role };
  }

  async login(dto: LoginDto): Promise<{
    access_token: string;
    user: { id: number; email: string; role: Role };
  }> {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async validateJwtPayload(
    payload: JwtPayload,
  ): Promise<{ sub: number; role: Role; email: string }> {
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Invalid token');
    return { sub: user.id, role: user.role, email: user.email };
  }
}
