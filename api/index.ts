import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

function toRegexPattern(pattern: string) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\\\*/g, '.*')}$`);
}

function isOriginAllowed(origin: string, allowedOrigins: string[]) {
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      return toRegexPattern(allowedOrigin).test(origin);
    }

    return allowedOrigin === origin;
  });
}

async function initializeServer() {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    const defaultOrigins =
      'http://localhost:3000,http://localhost:3001,https://*.vercel.app';
    const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? defaultOrigins)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    const strictCors = process.env.CORS_STRICT === 'true';

    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow?: boolean) => void,
      ) => {
        if (!strictCors) {
          callback(null, true);
          return;
        }

        if (!origin || isOriginAllowed(origin, allowedOrigins)) {
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

    await app.init();
    isInitialized = true;
  })();

  try {
    await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    isInitialized = false;
    throw error;
  }
}

export default async function handler(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  try {
    await initializeServer();
    server(req, res);
    return;
  } catch (error) {
    console.error('Serverless initialization failed', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        message:
          'Server initialization failed. Check MONGODB_URI and other backend environment variables.',
      }),
    );
  }
}
