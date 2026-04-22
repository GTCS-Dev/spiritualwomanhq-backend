import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Testimonial, TestimonialDocument } from './schemas/testimonial.schema';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
  ) {}

  findAll() {
    return this.testimonialModel.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  }

  findAllAdmin() {
    return this.testimonialModel.find().sort({ createdAt: -1 }).lean();
  }

  create(input: CreateTestimonialDto) {
    return this.testimonialModel.create(input);
  }

  async update(id: string, input: UpdateTestimonialDto) {
    const doc = await this.testimonialModel.findByIdAndUpdate(id, input, { new: true }).lean();
    if (!doc) throw new NotFoundException('Testimonial not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.testimonialModel.findByIdAndDelete(id).lean();
    if (!doc) throw new NotFoundException('Testimonial not found');
    return { deleted: true };
  }
}
