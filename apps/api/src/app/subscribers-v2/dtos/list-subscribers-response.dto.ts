import { ApiProperty } from '@nestjs/swagger';
import { ISubscriber } from '@novu/shared';
import { SubscriberResponseDto } from '../../subscribers/dtos';

export class ListSubscribersResponseDto {
  @ApiProperty({
    description: 'Array of subscriber objects',
    type: [SubscriberResponseDto],
  })
  subscribers: ISubscriber[];

  @ApiProperty({
    description: 'Indicates if there are more subscribers to fetch',
    required: false,
    type: Boolean,
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Number of subscribers in the current page',
    type: Number,
  })
  pageSize: number;
}
