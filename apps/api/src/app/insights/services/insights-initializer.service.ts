import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { UsageInsights } from '../usecases/usage-insights/usage-insights.usecase';

@Injectable()
export class InsightsInitializerService implements OnApplicationBootstrap {
  constructor(private usageInsights: UsageInsights) {}

  async onApplicationBootstrap() {
    try {
      Logger.log('Initializing usage insights...');

      Logger.log('Usage insights initialization completed');
    } catch (error) {
      Logger.error('Failed to initialize insights:', error);
    }
  }
}
