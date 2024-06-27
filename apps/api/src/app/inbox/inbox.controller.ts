import { Body, Controller, Get, Post, Patch, Query, UseGuards, Param } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubscriberEntity } from '@novu/dal';
import { MessageActionStatusEnum } from '@novu/shared';

import type { SubscriberSessionRequestDto } from './dtos/subscriber-session-request.dto';
import type { SubscriberSessionResponseDto } from './dtos/subscriber-session-response.dto';
import { SessionCommand } from './usecases/session/session.command';
import { Session } from './usecases/session/session.usecase';
import { ApiCommonResponses } from '../shared/framework/response.decorator';
import { SubscriberSession } from '../shared/framework/user.decorator';
import type { GetNotificationsRequestDto } from './dtos/get-notifications-request.dto';
import { GetNotifications } from './usecases/get-notifications/get-notifications.usecase';
import { GetNotificationsCommand } from './usecases/get-notifications/get-notifications.command';
import type { GetNotificationsResponseDto } from './dtos/get-notifications-response.dto';
import type { GetNotificationsCountRequestDto } from './dtos/get-notifications-count-request.dto';
import type { GetNotificationsCountResponseDto } from './dtos/get-notifications-count-response.dto';
import { NotificationsCount } from './usecases/notifications-count/notifications-count.usecase';
import { NotificationsCountCommand } from './usecases/notifications-count/notifications-count.command';
import { InboxNotification } from './utils/types';
import { MarkNotificationAsCommand } from './usecases/mark-notification-as/mark-notification-as.command';
import { MarkNotificationAs } from './usecases/mark-notification-as/mark-notification-as.usecase';
import { ActionTypeRequestDto } from './dtos/action-type-request.dto';
import { UpdateNotificationAction } from './usecases/update-notification-action/update-notification-action.usecase';
import { UpdateNotificationActionCommand } from './usecases/update-notification-action/update-notification-action.command';

@ApiCommonResponses()
@Controller('/inbox')
@ApiExcludeController()
export class InboxController {
  constructor(
    private initializeSessionUsecase: Session,
    private getNotificationsUsecase: GetNotifications,
    private notificationsCountUsecase: NotificationsCount,
    private markNotificationAsUsecase: MarkNotificationAs,
    private updateNotificationActionUsecase: UpdateNotificationAction
  ) {}

  @Post('/session')
  async sessionInitialize(@Body() body: SubscriberSessionRequestDto): Promise<SubscriberSessionResponseDto> {
    return await this.initializeSessionUsecase.execute(
      SessionCommand.create({
        subscriberId: body.subscriberId,
        applicationIdentifier: body.applicationIdentifier,
        subscriberHash: body.subscriberHash,
      })
    );
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Get('/notifications')
  async getNotifications(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Query() query: GetNotificationsRequestDto
  ): Promise<GetNotificationsResponseDto> {
    return await this.getNotificationsUsecase.execute(
      GetNotificationsCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        limit: query.limit,
        offset: query.offset,
        after: query.after,
        tags: query.tags,
        read: query.read,
        archived: query.archived,
      })
    );
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Get('/notifications/count')
  async getNotificationsCount(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Query()
    query: GetNotificationsCountRequestDto
  ): Promise<GetNotificationsCountResponseDto> {
    const res = await this.notificationsCountUsecase.execute(
      NotificationsCountCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        tags: query.tags,
        read: query.read,
        archived: query.archived,
      })
    );

    return res;
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Patch('/notifications/:id/mark-as-read')
  async markNotificationAsRead(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Param('id') notificationId: string
  ): Promise<InboxNotification> {
    return await this.markNotificationAsUsecase.execute(
      MarkNotificationAsCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        notificationId,
        read: true,
      })
    );
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Patch('/notifications/:id/mark-as-unread')
  async markNotificationAsUnread(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Param('id') notificationId: string
  ): Promise<InboxNotification> {
    return await this.markNotificationAsUsecase.execute(
      MarkNotificationAsCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        notificationId,
        read: false,
      })
    );
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Patch('/notifications/:id/mark-as-archived')
  async markNotificationAsArchived(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Param('id') notificationId: string
  ): Promise<InboxNotification> {
    return await this.markNotificationAsUsecase.execute(
      MarkNotificationAsCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        notificationId,
        archived: true,
      })
    );
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Patch('/notifications/:id/mark-as-unarchived')
  async markNotificationAsUnarchived(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Param('id') notificationId: string
  ): Promise<InboxNotification> {
    return await this.markNotificationAsUsecase.execute(
      MarkNotificationAsCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        notificationId,
        archived: false,
      })
    );
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Patch('/notifications/:id/complete')
  async completeAction(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Param('id') notificationId: string,
    @Body() body: ActionTypeRequestDto
  ): Promise<InboxNotification> {
    return await this.updateNotificationActionUsecase.execute(
      UpdateNotificationActionCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        notificationId,
        actionType: body.actionType,
        actionStatus: MessageActionStatusEnum.DONE,
      })
    );
  }

  @UseGuards(AuthGuard('subscriberJwt'))
  @Patch('/notifications/:id/revert')
  async revertAction(
    @SubscriberSession() subscriberSession: SubscriberEntity,
    @Param('id') notificationId: string,
    @Body() body: ActionTypeRequestDto
  ): Promise<InboxNotification> {
    return await this.updateNotificationActionUsecase.execute(
      UpdateNotificationActionCommand.create({
        organizationId: subscriberSession._organizationId,
        subscriberId: subscriberSession.subscriberId,
        environmentId: subscriberSession._environmentId,
        notificationId,
        actionType: body.actionType,
        actionStatus: MessageActionStatusEnum.PENDING,
      })
    );
  }
}
