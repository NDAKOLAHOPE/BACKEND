import { IsInt, Min, IsArray, ArrayMinSize } from 'class-validator';

export class AssignStudentsToParentDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  studentIds!: number[];
}