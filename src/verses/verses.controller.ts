import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVerseDto } from './dto/create-verse.dto';
import { UpdateVerseDto } from './dto/update-verse.dto';
import { VersesService } from './verses.service';

@Controller('verses')
export class VersesController {
  constructor(private readonly versesService: VersesService) {}

  @Get('active')
  findActive(@Query('period') period?: string) {
    return this.versesService.findActive(period);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAll() {
    return this.versesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() input: CreateVerseDto) {
    return this.versesService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateVerseDto) {
    return this.versesService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versesService.remove(id);
  }
}
