import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import type { Role } from '../../common/constants/roles.js';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'MERE'])
  role!: Role;
}
