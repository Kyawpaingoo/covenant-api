import { Module, forwardRef } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ActivityModule } from '../activity/activity.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [forwardRef(() => ActivityModule), SharedModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
