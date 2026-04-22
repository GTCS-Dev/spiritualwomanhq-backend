import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonialsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.testimonialsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() input: CreateTestimonialDto) {
    return this.testimonialsService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
