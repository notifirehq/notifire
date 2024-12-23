import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FeatureFlagsService } from '@novu/application-generic';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { UsageInsights } from './usecases/usage-insights/usage-insights.usecase';
import { UsageInsightsCommand } from './usecases/usage-insights/usage-insights.command';

@Controller({
  path: 'insights',
})
export class InsightsController {
  constructor(
    private usageInsights: UsageInsights,
    private featureFlagsService: FeatureFlagsService
  ) {}

  @Get('/execute')
  @ApiOperation({
    summary: 'Execute insights for a specific organization',
  })
  @ApiQuery({
    name: 'organizationId',
    type: String,
    required: true,
    description: 'The ID of the organization to execute insights for',
  })
  async executeInsights(@Query('organizationId') organizationId: string) {
    const isAllowedToTestInsights = await this.featureFlagsService.get(
      FeatureFlagsKeysEnum.IS_ALLOWED_TO_TEST_INSIGHTS_ENABLED,
      false,
      {
        organizationId,
        userId: 'system',
        environmentId: 'system',
      }
    );

    if (!isAllowedToTestInsights) {
      throw new UnauthorizedException('Organization is not allowed to test insights');
    }

    const command = new UsageInsightsCommand({ organizationId });

    return this.usageInsights.execute(command);
  }
}
