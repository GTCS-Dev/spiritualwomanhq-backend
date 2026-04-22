import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema';

@Injectable()
export class ContactMessagesService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactMessageModel: Model<ContactMessageDocument>,
  ) {}

  async create(input: CreateContactMessageDto) {
    const message = await this.contactMessageModel.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      message: input.message,
    });

    return {
      id: message._id.toString(),
        createdAt: (message as any).createdAt as Date,
    };
  }

  async findAll(limit = 100) {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 300) : 100;

    const docs = await this.contactMessageModel.find().sort({ createdAt: -1 }).limit(safeLimit).lean().exec();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      subject: doc.subject,
      message: doc.message,
      createdAt: (doc as any).createdAt as Date,
    }));
  }
}
