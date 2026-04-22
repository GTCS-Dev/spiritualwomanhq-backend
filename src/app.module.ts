import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { PostsModule } from './posts/posts.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { UploadsModule } from './uploads/uploads.module';
import { VersesModule } from './verses/verses.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/spiritualwoman', {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000,
      maxPoolSize: 5,
      minPoolSize: 0,
      family: 4,
      tls: true,
    }),
    AuthModule,
    ContactMessagesModule,
    PostsModule,
    TestimonialsModule,
    UploadsModule,
    VersesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
