import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://*.vercel.app',
    'https://spiritualwomanhq.vercel.app',
    'https://spiritualwomanhq.com',
    'https://www.spiritualwomanhq.com',
  ];

  const envOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = [
    ...new Set([...defaultAllowedOrigins, ...envOrigins]),
  ];
  const strictCors = process.env.CORS_STRICT === 'true';

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
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!strictCors) {
        callback(null, true);
        return;
      }

      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
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
void bootstrap();
