import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhooks
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3001,https://covenant-flow-z5s2oxtin-kyawpaingoos-projects.vercel.app');
  app.enableCors({
    origin: corsOrigins.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Code & Covenant API')
    .setDescription('REST API for the Code & Covenant freelance platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('profile', 'User profile management')
    .addTag('clients', 'Client management')
    .addTag('contracts', 'Contract engine')
    .addTag('invoices', 'Invoice management')
    .addTag('activity-logs', 'Activity tracking')
    .addTag('stripe', 'Payment integration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Start server
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`\n🚀 Code & Covenant API is running on http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs\n`);
}

bootstrap();
