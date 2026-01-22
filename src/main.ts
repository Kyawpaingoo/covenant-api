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

  // 1. Define CORS Origins first (so they can be used by Helmet and CORS)
  const originString = configService.get<string>(
    'CORS_ORIGINS', 
    'http://localhost:5173,http://localhost:3001'
  );
  const origins = originString.split(',').map((origin) => origin.trim());

  // 2. Enable CORS
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // 3. Security Middleware (Helmet)
  // Adjusted to allow Swagger UI and cross-origin requests
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        scriptSrc: [`'self'`, `'unsafe-inline'`, `https://cdn.jsdelivr.net`],
        imgSrc: [`'self'`, `data:`, `https://validator.swagger.io`],
        connectSrc: [`'self'`, ...origins], 
      },
    },
  }));

  

  // 4. Global validation pipe
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

  // 5. Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 6. Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Code & Covenant API')
    .setDescription('REST API for the Code & Covenant freelance platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('profile')
    // ... add other tags as needed
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 7. Start server
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`\n🚀 API is running on port: ${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs\n`);
}

bootstrap();