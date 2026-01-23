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
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        rawBody: true,
    });
    const configService = app.get(config_1.ConfigService);
    const originString = configService.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3001');
    const origins = originString.split(',').map((origin) => origin.trim());
    app.enableCors({
        origin: origins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    });
    app.use((0, helmet_1.default)({
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
        .addTag('auth')
        .addTag('profile')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || configService.get('PORT', 8080);
    await app.listen(port, '0.0.0.0');
    console.log(`\n🚀 API is running on port: ${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map