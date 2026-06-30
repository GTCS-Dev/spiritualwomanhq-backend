import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema';
import { EmailService } from '../email/email.service';

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 3;
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

@Injectable()
export class ContactMessagesService {
  private readonly logger = new Logger(ContactMessagesService.name);
  private readonly rateLimitMap = new Map<string, { count: number; windowStart: number }>();

  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactMessageModel: Model<ContactMessageDocument>,
    private readonly emailService: EmailService,
  ) {
    // Periodic cleanup of stale rate-limit entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.rateLimitMap.entries()) {
        if (now - value.windowStart > RATE_LIMIT_WINDOW_MS) {
          this.rateLimitMap.delete(key);
        }
      }
    }, RATE_LIMIT_CLEANUP_INTERVAL_MS).unref();
  }

  private isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      this.rateLimitMap.set(ip, { count: 1, windowStart: now });
      return false;
    }

    if (entry.count >= MAX_MESSAGES_PER_WINDOW) {
      return true;
    }

    entry.count++;
    return false;
  }

  async create(input: CreateContactMessageDto, clientIp?: string) {
    // Rate limiting check
    if (clientIp) {
      const limited = this.isRateLimited(clientIp);
      if (limited) {
        this.logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
        throw new Error('Too many messages. Please wait a moment before sending another message.');
      }
    }

    // Save message to database
    const message = await this.contactMessageModel.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      message: input.message,
    });

    this.logger.log(`Contact message saved to DB. ID: ${message._id}`);

    // Send email notification via Resend (awaited so errors propagate to the client)
    if (this.emailService.isConfigured) {
      const emailResult = await this.emailService.sendContactNotification({
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
      });

      if (!emailResult.success) {
        this.logger.error(
          `Failed to send email notification for message ${message._id}: ${emailResult.error}`,
        );
        throw new Error('Your message was saved, but the notification email could not be sent. Please try again later.');
      }

      this.logger.log(`Email notification sent successfully for message ${message._id}`);
    } else {
      this.logger.warn(
        'Email service not configured. Contact message saved to DB but no email notification was sent.',
      );
    }

    return {
      id: message._id.toString(),
      createdAt: (message as any).createdAt as Date,
    };
  }

  async findAll(limit = 100) {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 300) : 100;

    const docs = await this.contactMessageModel.find().sort({ createdAt: -1 }).limit(safeLimit).lean().exec();

    return docs.map((doc) => ({
      id: (doc as any)._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      subject: doc.subject,
      message: doc.message,
      createdAt: (doc as any).createdAt as Date,
    }));
  }
}