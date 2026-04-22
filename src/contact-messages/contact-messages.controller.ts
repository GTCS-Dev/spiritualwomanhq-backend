import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessagesService } from './contact-messages.service';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Post()
  create(@Body() input: CreateContactMessageDto) {
    return this.contactMessagesService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAll(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.contactMessagesService.findAll(parsedLimit);
  }
}
