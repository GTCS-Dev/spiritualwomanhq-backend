import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VersesController } from './verses.controller';
import { VersesService } from './verses.service';
import { Verse, VerseSchema } from './schemas/verse.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Verse.name, schema: VerseSchema }])],
  controllers: [VersesController],
  providers: [VersesService],
})
export class VersesModule {}
