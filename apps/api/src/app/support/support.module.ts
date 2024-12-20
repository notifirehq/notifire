import { Module } from '@nestjs/common';
import { SupportService } from '@novu/application-generic';
import { OrganizationRepository } from '@novu/dal';
import { SupportController } from './support.controller';
import { SharedModule } from '../shared/shared.module';
import { CreateSupportThreadUsecase, FetchUserOrganizationsUsecase } from './usecases';
import { PlainCardsGuard } from './guards/plain-cards.guard';

@Module({
  imports: [SharedModule],
  controllers: [SupportController],
  providers: [
    CreateSupportThreadUsecase,
    FetchUserOrganizationsUsecase,
    SupportService,
    OrganizationRepository,
    PlainCardsGuard,
  ],
})
export class SupportModule {}
