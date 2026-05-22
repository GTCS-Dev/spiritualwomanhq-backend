import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { PostBlockType, PostCategory } from '../types/post.type';

export type PostDocument = HydratedDocument<Post>;


@Schema({ _id: false })
export class PostBlockModel {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: ['heading2', 'heading3', 'paragraph', 'image'] })
  type: PostBlockType;

  @Prop()
  text?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: false })
  bold?: boolean;

  @Prop({ default: false })
  italic?: boolean;
}

export const PostBlockSchema = SchemaFactory.createForClass(PostBlockModel);

@Schema({ timestamps: true, versionKey: false })
export class Post {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true, maxlength: 220 })
  excerpt: string;

  @Prop({ required: true, enum: ['devotional', 'testimony', 'events', 'leadership', 'family', 'prayer'] })
  category: PostCategory;

  @Prop({ required: true })
  coverImage: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [PostBlockSchema], default: [] })
  blocks: PostBlockModel[];

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ required: true })
  author: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
