import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query('limit') limit?: string, @Query('category') category?: string) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.postsService.findAll(parsedLimit, category);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllForAdmin(@Query('limit') limit?: string, @Query('category') category?: string) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.postsService.findAll(parsedLimit, category, true);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() input: CreatePostDto) {
    return this.postsService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() input: UpdatePostDto) {
    return this.postsService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.publish(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/unpublish')
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.unpublish(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
