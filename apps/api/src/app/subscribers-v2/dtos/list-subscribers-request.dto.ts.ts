import { ApiProperty } from '@nestjs/swagger';
import { DirectionEnum, SubscriberGetListQueryParams } from '@novu/shared';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListSubscribersRequestDto implements SubscriberGetListQueryParams {
  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Cursor for pagination',
    required: false,
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiProperty({
    description: 'Sort direction',
    required: false,
    enum: DirectionEnum,
    default: DirectionEnum.DESC,
  })
  @IsEnum(DirectionEnum)
  @IsOptional()
  orderDirection?: DirectionEnum = DirectionEnum.DESC;

  @ApiProperty({
    description: 'Field to order by',
    required: false,
    enum: ['updatedAt', 'createdAt', 'lastOnlineAt'],
    default: 'createdAt',
  })
  @IsEnum(['updatedAt', 'createdAt', 'lastOnlineAt'])
  @IsOptional()
  orderBy?: 'updatedAt' | 'createdAt' | 'lastOnlineAt' = 'createdAt';

  @ApiProperty({
    description: 'Search query to filter subscribers by name, email, phone, or subscriberId',
    required: false,
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({
    description: 'Email to filter subscribers by',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Subscriber ID to filter subscribers by',
    required: false,
  })
  @IsString()
  @IsOptional()
  subscriberId?: string;

  @ApiProperty({
    description: 'Phone number to filter subscribers by',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
