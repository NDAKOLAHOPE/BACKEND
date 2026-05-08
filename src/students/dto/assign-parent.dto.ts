import { IsInt, Min } from 'class-validator';

export class AssignParentDto {
  @IsInt()
  @Min(1)
  parentId!: number;
}
