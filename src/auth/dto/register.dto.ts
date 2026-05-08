import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { Role } from '../../common/constants/roles.js';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'MERE'])
  role!: Role;

  // Optionnel : clé pour créer un ADMIN (si configurée côté serveur)
  @IsOptional()
  @IsString()
  adminKey?: string;
}
