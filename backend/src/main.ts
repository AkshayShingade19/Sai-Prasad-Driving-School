import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(logger);

  app.setGlobalPrefix('api');

  // Render (and most PaaS) sit behind a proxy — trust it so the
  // client IP and rate limiting see the real address.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // CORS — allow every configured frontend origin.
  // When the frontend is reached through a tunnel the browser sees a single
  // origin (the tunnel host) and the Vite proxy forwards /api here, so CORS is
  // not even consulted. This list matters for direct API access (e.g. from
  // another device on the LAN) and stays narrow on purpose.
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const allowAll = allowedOrigins.includes('*');

  app.enableCors({
    origin: allowAll
      ? true
      : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Same-origin / server-to-server requests have no Origin header.
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          // Unknown origin: omit the CORS headers instead of raising an error.
          // The browser then blocks it for cross-origin calls (correct), while
          // same-origin traffic through the tunnel is unaffected.
          return callback(null, false);
        },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ---------- Swagger ----------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sai Prasad Driving School API')
    .setDescription('Management system API for driving school operations')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Bind address.
  // Default: 127.0.0.1 only. The Vite dev server proxies /api to this
  // process on the same machine, so the backend does not need to listen on
  // the LAN. Set BIND_ADDRESS=0.0.0.0 to expose it on your local network.
  const bindAddress = process.env.BIND_ADDRESS || '127.0.0.1';
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, bindAddress);

  logger.log(`Server running on ${bindAddress}:${port}`);
  logger.log(`Swagger docs: /api/docs`);
  logger.log(`Allowed origins: ${allowedOrigins.join(', ')}`);

  // ---------- Graceful shutdown ----------
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });
}

void bootstrap();
