import { DirectionEnum } from '@novu/shared';
import { IsNumber, IsOptional, IsString, Max, Min, IsEnum } from 'class-validator';
import { EnvironmentCommand } from '../../../shared/commands/project.command';

export class ListSubscribersCommand extends EnvironmentCommand {
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number;

  @IsString()
  @IsOptional()
  cursor?: string;

  @IsEnum(DirectionEnum)
  @IsOptional()
  orderDirection: DirectionEnum = DirectionEnum.DESC;

  @IsEnum(['updatedAt', 'createdAt', 'lastOnlineAt'])
  @IsOptional()
  orderBy: 'updatedAt' | 'createdAt' | 'lastOnlineAt' = 'createdAt';

  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
