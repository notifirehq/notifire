import { forwardRef, Module } from '@nestjs/common';
// @ts-expect-error - TODO: bundle CJS with @novu/framework
import { NovuModule, NovuClient } from '@novu/framework/nest';

import { EnvironmentRepository, NotificationTemplateRepository } from '@novu/dal';
import { GetDecryptedSecretKey } from '@novu/application-generic';
import { SharedModule } from '../shared/shared.module';
import { USE_CASES } from './usecases';
import { EnvironmentsController } from './environments.controller';
import { NotificationGroupsModule } from '../notification-groups/notification-groups.module';
import { AuthModule } from '../auth/auth.module';
import { LayoutsModule } from '../layouts/layouts.module';
import { NovuBridgeClient } from './novu-bridge-client';
import { CreateFrameworkWorkflow } from './usecases/create-framework-workflow';

@Module({
  imports: [
    SharedModule,
    NotificationGroupsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => LayoutsModule),
    NovuModule.register(
      {
        apiPath: '/environments/:environmentId/bridge',
        workflows: [],
      },
      [
        {
          provide: NovuClient,
          useClass: NovuBridgeClient,
        },
        EnvironmentRepository,
        NotificationTemplateRepository,
        CreateFrameworkWorkflow,
        GetDecryptedSecretKey,
      ]
    ),
  ],
  controllers: [EnvironmentsController],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class EnvironmentsModule {}
