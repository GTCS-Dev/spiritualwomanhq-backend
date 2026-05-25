import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://*.vercel.app',
  'https://spiritualwomanhq.vercel.app',
  'https://spiritualwomanhq.com',
  'https://www.spiritualwomanhq.com',
];

function getAllowedOrigins() {
  const envOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...defaultAllowedOrigins, ...envOrigins])];
}

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

function setCorsHeaders(req: express.Request, res: express.Response) {
  const strictCors = process.env.CORS_STRICT === 'true';
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = req.headers.origin;
  const resolvedOrigin =
    typeof requestOrigin === 'string' ? requestOrigin : undefined;

  if (!resolvedOrigin) {
    return;
  }

  if (!strictCors || isOriginAllowed(resolvedOrigin, allowedOrigins)) {
    res.setHeader('Access-Control-Allow-Origin', resolvedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
}

async function initializeServer() {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        abortOnError: false,
      },
    );
    const allowedOrigins = getAllowedOrigins();
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
  setCorsHeaders(req, res);

  if (req.path === '/_diag') {
    const mongoUri = process.env.MONGODB_URI ?? '';
    const mongoScheme = mongoUri.startsWith('mongodb+srv://')
      ? 'mongodb+srv'
      : mongoUri.startsWith('mongodb://')
        ? 'mongodb'
        : 'missing-or-invalid';

    res.status(200).json({
      ok: true,
      runtime: {
        node: process.version,
        vercel: Boolean(process.env.VERCEL),
        region: process.env.VERCEL_REGION ?? null,
      },
      env: {
        mongoUriPresent: Boolean(process.env.MONGODB_URI),
        mongoScheme,
        jwtSecretPresent: Boolean(process.env.JWT_SECRET),
        adminUsernamePresent: Boolean(process.env.ADMIN_USERNAME),
        adminPasswordPresent: Boolean(process.env.ADMIN_PASSWORD),
        adminPasswordHashPresent: Boolean(process.env.ADMIN_PASSWORD_HASH),
      },
      note: 'No secret values are returned from this endpoint.',
    });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await initializeServer();
    server(req, res);
    return;
  } catch (error) {
    console.error('Serverless initialization failed', error);
    const err = error as Error & { code?: string; name?: string };

    let hint =
      'Check MONGODB_URI and required backend environment variables in Vercel.';
    if (err?.name === 'MongooseServerSelectionError') {
      hint =
        'MongoDB Atlas is unreachable from Vercel. Check Atlas Network Access (0.0.0.0/0), DB user credentials, and URI password encoding.';
    } else if (err?.message?.includes('MONGODB_URI is missing')) {
      hint =
        'Set MONGODB_URI in Vercel Project Settings for the Production environment and redeploy.';
    }

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        message: 'Server initialization failed.',
        errorType: err?.name ?? 'Error',
        errorCode: err?.code,
        hint,
      }),
    );
  }
}
