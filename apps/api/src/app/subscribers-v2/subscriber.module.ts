import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { SubscriberController } from './subscriber.controller';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';

const USE_CASES = [ListSubscribersUseCase];

@Module({
  imports: [SharedModule],
  controllers: [SubscriberController],
  providers: [...USE_CASES],
})
export class SubscriberModule {}
