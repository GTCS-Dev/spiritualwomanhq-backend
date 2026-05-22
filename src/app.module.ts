import { Module } from '@nestjs/common';
import { MongooseModule, type MongooseModuleOptions } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { PostsModule } from './posts/posts.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { UploadsModule } from './uploads/uploads.module';
import { VersesModule } from './verses/verses.module';

const localMongoUri = 'mongodb://127.0.0.1:27017/spiritualwoman';
const mongoUri = process.env.MONGODB_URI ?? localMongoUri;

if (process.env.VERCEL && !process.env.MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is missing in Vercel production environment variables.',
  );
}

const mongooseOptions: MongooseModuleOptions = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 8000,
  maxPoolSize: 5,
  minPoolSize: 0,
};

if (process.env.MONGODB_TLS === 'true') {
  mongooseOptions.tls = true;
}

if (process.env.MONGODB_TLS === 'false') {
  mongooseOptions.tls = false;
}

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri, mongooseOptions),
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
