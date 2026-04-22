import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVerseDto } from './dto/create-verse.dto';
import { UpdateVerseDto } from './dto/update-verse.dto';
import { Verse, VerseDocument } from './schemas/verse.schema';

@Injectable()
export class VersesService {
  constructor(@InjectModel(Verse.name) private verseModel: Model<VerseDocument>) {}

  findAll() {
    return this.verseModel.find().sort({ createdAt: -1 }).lean();
  }

  findActive(period?: string) {
    const query: Record<string, unknown> = { isActive: true };
    if (period) query.period = period;
    return this.verseModel.findOne(query).sort({ createdAt: -1 }).lean();
  }

  create(input: CreateVerseDto) {
    return this.verseModel.create(input);
  }

  async update(id: string, input: UpdateVerseDto) {
    const doc = await this.verseModel.findByIdAndUpdate(id, input, { new: true }).lean();
    if (!doc) throw new NotFoundException('Verse not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.verseModel.findByIdAndDelete(id).lean();
    if (!doc) throw new NotFoundException('Verse not found');
    return { deleted: true };
  }
}
