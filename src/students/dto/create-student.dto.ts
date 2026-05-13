import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsString()
  @Length(2, 100)
  firstName!: string;

  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsPhoneNumber()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @IsOptional()
  @IsString()
  studentIdNumber?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'TRANSFERRED';
}
