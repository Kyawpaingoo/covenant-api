import { Module, Global } from '@nestjs/common';
import { S3Service } from '../aws/s3.service';
import { PdfService } from '../pdf/pdf.service';

@Global()
@Module({
  providers: [S3Service, PdfService],
  exports: [S3Service, PdfService],
})
export class SharedModule {}
