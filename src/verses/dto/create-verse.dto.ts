import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVerseDto {
  @IsString()
  @MinLength(4)
  text: string;

  @IsString()
  @MinLength(2)
  reference: string;

  @IsOptional()
  @IsIn(['day', 'week'])
  period?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
