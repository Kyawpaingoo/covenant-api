import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './prisma';

// Feature modules
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { ProfileModule } from './modules/profile';
import { ClientsModule } from './modules/clients';
import { ContractsModule } from './modules/contracts';
import { InvoicesModule } from './modules/invoices';
import { ActivityModule } from './modules/activity';
import { StripeModule } from './modules/stripe';
import { EmailModule } from './modules/email';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50, // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Core
    PrismaModule,

    // Features
    AuthModule,
    UsersModule,
    ProfileModule,
    ClientsModule,
    ContractsModule,
    InvoicesModule,
    ActivityModule,
    StripeModule,
    EmailModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
