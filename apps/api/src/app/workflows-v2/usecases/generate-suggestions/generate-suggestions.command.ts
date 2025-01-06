import { EnvironmentWithUserCommand } from '@novu/application-generic';
import { IsString, IsDefined, IsEnum } from 'class-validator';

export enum WorkflowModeEnum {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export class GenerateSuggestionsCommand extends EnvironmentWithUserCommand {
  @IsDefined()
  @IsString()
  prompt: string;

  @IsString()
  @IsEnum(WorkflowModeEnum)
  mode?: WorkflowModeEnum;
}
