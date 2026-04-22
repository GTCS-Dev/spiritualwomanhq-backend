import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ timestamps: true, versionKey: false })
export class Testimonial {
  @Prop({ required: true })
  quote: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop({ default: true })
  isPublished: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
