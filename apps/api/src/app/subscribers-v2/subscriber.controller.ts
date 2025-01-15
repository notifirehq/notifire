import { Controller, Get, Query, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserSession, UserAuthGuard } from '@novu/application-generic';
import { DirectionEnum, ListSubscriberResponse, UserSessionData } from '@novu/shared';
import { ApiCommonResponses } from '../shared/framework/response.decorator';

import { ListSubscribersCommand } from './usecases/list-subscribers/list-subscribers.command';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { ListSubscribersRequestDto } from './dtos/list-subscribers-request.dto.ts';

@Controller({ path: '/subscribers', version: '2' })
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(UserAuthGuard)
@ApiTags('Subscribers')
@ApiCommonResponses()
export class SubscriberController {
  constructor(private listSubscribersUsecase: ListSubscribersUseCase) {}

  @Get('')
  @ApiOperation({
    summary: 'List subscribers',
    description: 'Returns a paginated list of subscribers',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of subscribers with pagination information',
    type: ListSubscriberResponse,
  })
  async getSubscribers(
    @UserSession() user: UserSessionData,
    @Query() query: ListSubscribersRequestDto
  ): Promise<ListSubscriberResponse> {
    return await this.listSubscribersUsecase.execute(
      ListSubscribersCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        limit: query.limit || 10,
        cursor: query.cursor,
        orderDirection: query.orderDirection || DirectionEnum.DESC,
        orderBy: query.orderBy || 'createdAt',
        query: query.query,
        email: query.email,
        phone: query.phone,
      })
    );
  }
}
