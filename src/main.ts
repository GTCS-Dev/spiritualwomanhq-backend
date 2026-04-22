import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  function toRegexPattern(pattern: string) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped.replace(/\\\*/g, '.*')}$`);
  }

  function isOriginAllowed(origin: string) {
    return allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin.includes('*')) {
        return toRegexPattern(allowedOrigin).test(origin);
      }

      return allowedOrigin === origin;
    });
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
