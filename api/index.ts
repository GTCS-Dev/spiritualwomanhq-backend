import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from '../src/app.module';

const server = express();
let isInitialized = false;

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

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const defaultOrigins = 'http://localhost:3000,http://localhost:3001,https://*.vercel.app';
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? defaultOrigins)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const strictCors = process.env.CORS_STRICT === 'true';

  app.enableCors({
    origin: (origin, callback) => {
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
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await initializeServer();
  return server(req as express.Request, res as express.Response);
}
