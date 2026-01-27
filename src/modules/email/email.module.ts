import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { PdfService } from './pdf.service';
import { PrismaModule } from '../../prisma';
import { ActivityModule } from '../activity';

@Module({
  imports: [ConfigModule, PrismaModule, ActivityModule],
  controllers: [EmailController],
  providers: [EmailService, PdfService],
  exports: [EmailService, PdfService],
})
export class EmailModule {}
