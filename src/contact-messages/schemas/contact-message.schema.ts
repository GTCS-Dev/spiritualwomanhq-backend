import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactMessageDocument = HydratedDocument<ContactMessage>;

@Schema({ timestamps: true })
export class ContactMessage {
  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true, maxlength: 120 })
  email: string;

  @Prop({ trim: true, maxlength: 30 })
  phone?: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  subject: string;

  @Prop({ required: true, trim: true, maxlength: 2500 })
  message: string;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
