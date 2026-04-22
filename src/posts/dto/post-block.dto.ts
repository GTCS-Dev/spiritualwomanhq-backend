import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { PostBlockType } from '../types/post.type';

export class PostBlockDto {
  @IsString()
  id: string;

  @IsIn(['heading2', 'heading3', 'paragraph', 'image'] satisfies PostBlockType[])
  type: PostBlockType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  text?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  bold?: boolean;

  @IsOptional()
  @IsBoolean()
  italic?: boolean;
}
