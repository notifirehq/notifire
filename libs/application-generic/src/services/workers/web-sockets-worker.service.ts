import { JobTopicNameEnum } from '@novu/shared';

import { WorkerBaseService } from './worker-base.service';
import { BullMqService } from '../bull-mq';

const LOG_CONTEXT = 'WebSocketsWorkerService';

export class WebSocketsWorkerService extends WorkerBaseService {
  constructor(public bullMqService: BullMqService) {
    super(JobTopicNameEnum.WEB_SOCKETS, bullMqService);
  }
}
