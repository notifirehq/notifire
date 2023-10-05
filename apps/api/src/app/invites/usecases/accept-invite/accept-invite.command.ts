import { IsOptional, IsString } from 'class-validator';
import { AuthenticatedCommand } from '../../../shared/commands/authenticated.command';
import { CustomDataType } from '@novu/shared';

export class AcceptInviteCommand extends AuthenticatedCommand {
  @IsString()
  readonly token: string;

  @IsOptional()
  config?: CustomDataType;
}
