import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { Competition, CompetitionDocument } from './schemas/competition.schema';

type CompetitionView = {
  id: string;
  name: string;
  competitionId: string;
  competition: string;
  ageCategory: string;
  position: string;
  picture: string;
  year: string;
  createdAt: string;
};

type CompetitionRecord = {
  _id: unknown;
  name?: string;
  competitionId?: string;
  competition?: string;
  ageCategory?: string;
  position?: string;
  picture?: string;
  year?: string;
  createdAt?: string | Date;
};

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectModel(Competition.name)
    private readonly competitionModel: Model<CompetitionDocument>,
  ) {}

  private toView(input: CompetitionRecord): CompetitionView {
    const { _id, ...rest } = input;
    return {
      id: String(_id),
      name: rest.name ?? '',
      competitionId: rest.competitionId ?? '',
      competition: rest.competition ?? '',
      ageCategory: rest.ageCategory ?? '',
      position: rest.position ?? '',
      picture: rest.picture ?? '',
      year: rest.year ?? '',
      createdAt:
        rest.createdAt instanceof Date
          ? rest.createdAt.toISOString()
          : (rest.createdAt ?? new Date(0).toISOString()),
    };
  }

  async findAll() {
    const docs = await this.competitionModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => this.toView(doc as CompetitionRecord));
  }

  async findAllAdmin() {
    const docs = await this.competitionModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => this.toView(doc as CompetitionRecord));
  }

  async create(input: CreateCompetitionDto) {
    const doc = await this.competitionModel.create(input);
    const plain = doc.toObject() as unknown as CompetitionRecord;
    return this.toView(plain);
  }

  async update(id: string, input: UpdateCompetitionDto) {
    const doc = await this.competitionModel
      .findByIdAndUpdate(id, input, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Competition winner not found');
    return this.toView(doc);
  }

  async remove(id: string) {
    const doc = await this.competitionModel.findByIdAndDelete(id).lean();
    if (!doc) throw new NotFoundException('Competition winner not found');
    return { deleted: true };
  }
}
