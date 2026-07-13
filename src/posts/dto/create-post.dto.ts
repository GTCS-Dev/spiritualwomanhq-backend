import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import type { PostCategory } from '../types/post.type';
import { PostBlockDto } from './post-block.dto';

export class CreatePostDto {
  @IsString()
  @MinLength(4)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(220)
  excerpt: string;

  @IsIn(['devotional', 'testimony', 'events', 'leadership', 'family', 'prayer', 'article', 'blog', 'post'] satisfies PostCategory[])
  category: PostCategory;

  @IsString()
  @MinLength(4)
  coverImage: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostBlockDto)
  blocks?: PostBlockDto[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  author: string;
}
