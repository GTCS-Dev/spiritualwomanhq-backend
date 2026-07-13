import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './schemas/post.schema';
import { BlogPost } from './types/post.type';

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) {}

  async onModuleInit() {
    await this.seedPostsIfNeeded();
  }

  async findAll(limit?: number, category?: string, includeDrafts = false) {
    const query = this.postModel.find();

    if (!includeDrafts) {
      query.where('isPublished').equals(true);
    }

    if (category) {
      query.where('category').equals(category);
    }

    query.sort({ createdAt: -1 });

    if (limit && !Number.isNaN(limit)) {
      query.limit(limit);
    }

    const docs = await query.exec();
    return docs.map((doc) => this.toBlogPost(doc));
  }

  async findOne(id: number, includeDrafts = false) {
    const post = await this.postModel.findOne({ id }).exec();
    if (!post || (!includeDrafts && !post.isPublished)) {
      throw new NotFoundException('Post not found');
    }
    return this.toBlogPost(post);
  }

  async findBySlug(slug: string, includeDrafts = false) {
    const post = await this.postModel.findOne({ slug }).exec();
    if (!post || (!includeDrafts && !post.isPublished)) {
      throw new NotFoundException('Post not found');
    }
    return this.toBlogPost(post);
  }

  async create(input: CreatePostDto) {
    const latest = await this.postModel.findOne().sort({ id: -1 }).exec();
    const nextId = (latest?.id ?? 0) + 1;

    const post = await this.postModel.create({
      id: nextId,
      title: input.title,
      slug: this.toSlug(input.title),
      excerpt: input.excerpt,
      category: input.category,
      coverImage: input.coverImage,
      content: input.content,
      blocks: input.blocks ?? [],
      isPublished: input.isPublished ?? true,
      author: input.author,
    });

    return this.toBlogPost(post);
  }

  async update(id: number, input: UpdatePostDto) {
    const target = await this.postModel.findOne({ id }).exec();

    if (!target) {
      throw new NotFoundException('Post not found');
    }

    if (input.title) {
      target.title = input.title;
      target.slug = this.toSlug(input.title);
    }

    if (input.excerpt) {
      target.excerpt = input.excerpt;
    }

    if (input.category) {
      target.category = input.category;
    }

    if (input.coverImage) {
      target.coverImage = input.coverImage;
    }

    if (input.content) {
      target.content = input.content;
    }

    if (input.blocks) {
      target.blocks = input.blocks;
    }

    if (input.isPublished !== undefined) {
      target.isPublished = input.isPublished;
    }

    if (input.author) {
      target.author = input.author;
    }

    await target.save();

    return this.toBlogPost(target);
  }

  async remove(id: number) {
    const removed = await this.postModel.findOneAndDelete({ id }).exec();

    if (!removed) {
      throw new NotFoundException('Post not found');
    }

    return this.toBlogPost(removed);
  }

  async publish(id: number) {
    const target = await this.postModel.findOne({ id }).exec();

    if (!target) {
      throw new NotFoundException('Post not found');
    }

    target.isPublished = true;
    await target.save();

    return this.toBlogPost(target);
  }

  async unpublish(id: number) {
    const target = await this.postModel.findOne({ id }).exec();

    if (!target) {
      throw new NotFoundException('Post not found');
    }

    target.isPublished = false;
    await target.save();

    return this.toBlogPost(target);
  }

  private seedPosts(): Omit<BlogPost, 'createdAt' | 'updatedAt'>[] {
    return [
      {
        id: 1,
        title: 'How To Keep A Consistent Prayer Life In Busy Seasons',
        slug: 'how-to-keep-a-consistent-prayer-life-in-busy-seasons',
        excerpt: 'Simple rhythms that keep your heart connected to God even with packed schedules.',
        category: 'prayer',
        coverImage: '/images/blog-prayer-rhythm.jpg',
        content:
          'Prayer is most powerful when it is personal and consistent. Start with simple daily rhythms and build from there.',
        blocks: [
          {
            id: 'b1',
            type: 'heading2',
            text: 'Start Small And Stay Faithful',
            bold: true,
          },
          {
            id: 'b2',
            type: 'paragraph',
            text: 'Set two short prayer moments each day. Faithfulness in little moments leads to deeper intimacy with God.',
          },
          {
            id: 'b3',
            type: 'image',
            imageUrl: '/images/blog-prayer-rhythm.jpg',
          },
        ],
        isPublished: true,
        author: 'Pastor Miriam Cole',
      },
      {
        id: 2,
        title: 'A Testimony Of Healing Through Community',
        slug: 'a-testimony-of-healing-through-community',
        excerpt: 'One woman\'s journey from silent pain to restored joy through fellowship support.',
        category: 'testimony',
        coverImage: '/images/blog-testimony-light.jpg',
        content: 'Community creates room for healing, honesty, and restoration.',
        blocks: [
          {
            id: 'b1',
            type: 'heading2',
            text: 'When We Open Up, God Moves',
          },
          {
            id: 'b2',
            type: 'paragraph',
            text: 'Sharing in safe fellowship broke isolation and brought practical support and deep spiritual renewal.',
            italic: true,
          },
          {
            id: 'b3',
            type: 'image',
            imageUrl: '/images/blog-testimony-light.jpg',
          },
        ],
        isPublished: true,
        author: 'Grace N.',
      },
      {
        id: 3,
        title: 'Upcoming Women Fellowship Retreat: What To Expect',
        slug: 'upcoming-women-fellowship-retreat-what-to-expect',
        excerpt: 'Prepare spiritually and practically for a weekend of worship and renewal.',
        category: 'events',
        coverImage: '/images/blog-events-gathering.jpg',
        content: 'Our retreat weekend is designed for spiritual reset and bold expectation.',
        blocks: [
          {
            id: 'b1',
            type: 'heading2',
            text: 'Retreat Focus',
          },
          {
            id: 'b2',
            type: 'paragraph',
            text: 'Expect worship, intentional prayer time, leadership sessions, and personal reflection moments.',
            bold: true,
          },
          {
            id: 'b3',
            type: 'image',
            imageUrl: '/images/blog-events-gathering.jpg',
          },
        ],
        isPublished: true,
        author: 'SpiritualWoman Team',
      },
      {
        id: 4,
        title: 'Leadership Lessons From Deborah',
        slug: 'leadership-lessons-from-deborah',
        excerpt: 'Biblical leadership principles women can apply in ministry and daily life.',
        category: 'leadership',
        coverImage: '/images/blog-leadership-deborah.jpg',
        content: 'Deborah demonstrates courage, discernment, and faith-rooted leadership.',
        blocks: [
          {
            id: 'b1',
            type: 'paragraph',
            text: 'Leadership anchored in obedience produces lasting impact in every sphere of influence.',
          },
        ],
        isPublished: true,
        author: 'Elder Naomi Bright',
      },
      {
        id: 5,
        title: 'Devotional: Peace For Anxious Minds',
        slug: 'devotional-peace-for-anxious-minds',
        excerpt: 'A scripture-based devotional for women navigating anxious thoughts.',
        category: 'devotional',
        coverImage: '/images/blog-devotional-peace.jpg',
        content: 'God provides peace that guards our hearts and minds.',
        blocks: [
          {
            id: 'b1',
            type: 'paragraph',
            text: 'Breathe deeply, pray honestly, and speak scripture over your day.',
          },
        ],
        isPublished: false,
        author: 'SpiritualWoman Team',
      },
    ];
  }

  private async seedPostsIfNeeded() {
    const count = await this.postModel.estimatedDocumentCount();

    if (count > 0) {
      return;
    }

    const seeded = this.seedPosts().map((post, index) => {
      const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * (index + 1));
      return {
        ...post,
        createdAt,
        updatedAt: createdAt,
      };
    });

    await this.postModel.insertMany(seeded);
  }

  private toBlogPost(post: PostDocument): BlogPost {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      coverImage: post.coverImage,
      content: post.content,
      blocks: post.blocks,
      isPublished: post.isPublished,
      author: post.author,
      createdAt: new Date(post.createdAt).toISOString(),
      updatedAt: new Date(post.updatedAt).toISOString(),
    };
  }

  private toSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
