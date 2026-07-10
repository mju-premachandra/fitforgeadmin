import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateExerciseDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  instructions: string;

  @IsString()
  frontMuscleImage: string;

  @IsString()
  backMuscleImage: string;

  @IsString()
  video: string;
}
