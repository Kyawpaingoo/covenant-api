"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const filters_1 = require("./common/filters");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:5173');
    app.enableCors({
        origin: corsOrigins.split(',').map((origin) => origin.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new filters_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`\n🚀 Code & Covenant API is running on http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map