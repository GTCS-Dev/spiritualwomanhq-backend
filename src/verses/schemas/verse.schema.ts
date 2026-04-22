import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VerseDocument = HydratedDocument<Verse>;

@Schema({ timestamps: true, versionKey: false })
export class Verse {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  reference: string;

  @Prop({ default: 'week', enum: ['day', 'week'] })
  period: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const VerseSchema = SchemaFactory.createForClass(Verse);
