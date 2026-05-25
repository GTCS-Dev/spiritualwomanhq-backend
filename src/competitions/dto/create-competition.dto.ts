import { IsString, MinLength } from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  competitionId: string;

  @IsString()
  @MinLength(2)
  competition: string;

  @IsString()
  ageCategory: string;

  @IsString()
  @MinLength(2)
  position: string;

  @IsString()
  @MinLength(8)
  picture: string;

  @IsString()
  @MinLength(4)
  year: string;
}
