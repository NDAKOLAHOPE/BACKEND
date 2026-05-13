import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateClassGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['Maternelle', 'Primaire', 'College', 'Lycee', 'Universite'])
  level?: 'Maternelle' | 'Primaire' | 'College' | 'Lycee' | 'Universite';

  @IsOptional()
  @IsEnum(['GENERAL', 'SCIENTIFIC', 'LITERARY', 'TECHNICAL', 'VOCATIONAL', 'OTHER'])
  section?: 'GENERAL' | 'SCIENTIFIC' | 'LITERARY' | 'TECHNICAL' | 'VOCATIONAL' | 'OTHER';

  @IsOptional()
  @IsInt()
  academicYearId?: number;

  @IsOptional()
  @IsInt()
  classTeacherId?: number;
}
