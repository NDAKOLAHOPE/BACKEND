import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateClassGroupDto {
  @IsString()
  name!: string;

  @IsEnum(['Maternelle', 'Primaire', 'College', 'Lycee', 'Universite'])
  level!: 'Maternelle' | 'Primaire' | 'College' | 'Lycee' | 'Universite';

  @IsOptional()
  @IsEnum(['GENERAL', 'SCIENTIFIC', 'LITERARY', 'TECHNICAL', 'VOCATIONAL', 'OTHER'])
  section?: 'GENERAL' | 'SCIENTIFIC' | 'LITERARY' | 'TECHNICAL' | 'VOCATIONAL' | 'OTHER';

  @IsInt()
  academicYearId!: number;

  @IsOptional()
  @IsInt()
  classTeacherId?: number;
}
