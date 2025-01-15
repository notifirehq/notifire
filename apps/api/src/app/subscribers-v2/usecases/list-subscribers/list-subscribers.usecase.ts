import { Injectable } from '@nestjs/common';
import { SubscriberRepository } from '@novu/dal';
import { InstrumentUsecase } from '@novu/application-generic';
import { DirectionEnum, ISubscriberResponseDto, ListSubscriberResponse } from '@novu/shared';
import { ListSubscribersCommand } from './list-subscribers.command';
import { ListSubscribersResponseDto } from '../../dtos/list-subscribers-response.dto';

@Injectable()
export class ListSubscribersUseCase {
  constructor(private subscriberRepository: SubscriberRepository) {}

  @InstrumentUsecase()
  async execute(command: ListSubscribersCommand): Promise<ListSubscribersResponseDto> {
    const query = {
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
    } as const;

    if (command.query || command.email || command.phone) {
      const searchConditions: Record<string, unknown>[] = [];

      if (command.query) {
        searchConditions.push(
          ...[
            { subscriberId: { $regex: command.query, $options: 'i' } },
            { email: { $regex: command.query, $options: 'i' } },
            { phone: { $regex: command.query, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$firstName', ' ', '$lastName'] },
                  regex: command.query,
                  options: 'i',
                },
              },
            },
          ]
        );
      }

      if (command.email) {
        searchConditions.push({ email: { $regex: command.email, $options: 'i' } });
      }

      if (command.phone) {
        searchConditions.push({ phone: { $regex: command.phone, $options: 'i' } });
      }

      Object.assign(query, { $or: searchConditions });
    }

    if (command.cursor) {
      const operator = command.orderDirection === DirectionEnum.ASC ? '$gt' : '$lt';
      Object.assign(query, {
        [command.orderBy]: { [operator]: command.cursor },
      });
    }

    const subscribers = await this.subscriberRepository.find(query, undefined, {
      limit: command.limit + 1, // Get one extra to determine if there are more items
      sort: { [command.orderBy]: command.orderDirection === DirectionEnum.ASC ? 1 : -1 },
    });

    const hasMore = subscribers.length > command.limit;
    const data = hasMore ? subscribers.slice(0, -1) : subscribers;

    return {
      subscribers: data,
      hasMore,
      pageSize: command.limit,
    };
  }
}
