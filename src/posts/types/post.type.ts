export type PostCategory =
  | 'devotional'
  | 'testimony'
  | 'events'
  | 'leadership'
  | 'family'
  | 'prayer';

export type PostBlockType = 'heading2' | 'heading3' | 'paragraph' | 'image';

export interface PostBlock {
  id: string;
  type: PostBlockType;
  text?: string;
  imageUrl?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory;
  coverImage: string;
  content: string;
  blocks: PostBlock[];
  isPublished: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}
