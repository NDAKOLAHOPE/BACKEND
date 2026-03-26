import { IsOptional, IsString } from 'class-validator';

export class AssignClassDto {
  @IsString()
  className!: string;

  @IsOptional()
  @IsString()
  // Optionnel : permet d’effacer la classe en envoyant une chaîne vide
  // (géré côté service)
  _clear?: string;
}

