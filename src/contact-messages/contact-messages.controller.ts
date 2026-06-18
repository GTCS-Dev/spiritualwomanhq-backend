import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessagesService } from './contact-messages.service';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Post()
  create(@Body() input: CreateContactMessageDto, @Req() req: Request) {
    const clientIp = this.extractClientIp(req);
    return this.contactMessagesService.create(input, clientIp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAll(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.contactMessagesService.findAll(parsedLimit);
  }

  private extractClientIp(req: Request): string | undefined {
    // Check x-forwarded-for first (when behind proxy/Vercel)
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }

    // Fall back to x-real-ip
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp.trim();
    }

    // Last resort: use the connection remote address
    return req.ip ?? req.socket?.remoteAddress;
  }
}