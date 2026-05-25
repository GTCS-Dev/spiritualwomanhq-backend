import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompetitionDocument = HydratedDocument<Competition>;

@Schema({ timestamps: true, versionKey: false })
export class Competition {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  competitionId: string;

  @Prop({ required: true })
  competition: string;

  @Prop({ default: '' })
  ageCategory: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  picture: string;

  @Prop({ required: true })
  year: string;
}

export const CompetitionSchema = SchemaFactory.createForClass(Competition);
