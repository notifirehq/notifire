import { Test } from '@nestjs/testing';

import { StandardQueueService } from './standard-queue.service';

let standardQueueService: StandardQueueService;

describe('Standard Queue service', () => {
  beforeAll(async () => {
    standardQueueService = new StandardQueueService();
    await standardQueueService.queue.obliterate();
  });

  beforeEach(async () => {
    await standardQueueService.queue.drain();
  });

  afterAll(async () => {
    await standardQueueService.gracefulShutdown();
  });

  it('should be initialised properly', async () => {
    expect(standardQueueService).toBeDefined();
    expect(Object.keys(standardQueueService)).toEqual(
      expect.arrayContaining(['name', 'DEFAULT_ATTEMPTS', 'instance', 'queue'])
    );
    expect(standardQueueService.DEFAULT_ATTEMPTS).toEqual(3);
    expect(standardQueueService.name).toEqual('standard');
    expect(await standardQueueService.bullMqService.getRunningStatus()).toEqual(
      {
        queueIsPaused: false,
        queueName: 'standard',
        workerName: undefined,
        workerIsRunning: undefined,
      }
    );
    expect(standardQueueService.queue).toMatchObject(
      expect.objectContaining({
        _events: {},
        _eventsCount: 0,
        _maxListeners: undefined,
        name: 'standard',
        jobsOpts: {
          removeOnComplete: true,
        },
      })
    );
    expect(standardQueueService.queue.opts).toMatchObject(
      expect.objectContaining({
        blockingConnection: false,
        connection: {
          connectTimeout: 50000,
          db: 1,
          family: 4,
          host: 'localhost',
          keepAlive: 7200,
          keyPrefix: '',
          password: undefined,
          port: 6379,
          tls: undefined,
        },
        defaultJobOptions: {
          removeOnComplete: true,
        },
        prefix: 'bull',
        sharedConnection: false,
      })
    );
    expect(standardQueueService.queue.opts.connection).toMatchObject(
      expect.objectContaining({
        host: 'localhost',
        port: 6379,
      })
    );
  });

  it('should add a job in the queue', async () => {
    const jobId = 'standard-job-id';
    const _environmentId = 'standard-environment-id';
    const _organizationId = 'standard-organization-id';
    const _userId = 'standard-user-id';
    const jobData = {
      _id: jobId,
      test: 'standard-job-data',
      _environmentId,
      _organizationId,
      _userId,
    };
    await standardQueueService.add(jobId, jobData, _organizationId);

    expect(await standardQueueService.queue.getActiveCount()).toEqual(0);
    expect(await standardQueueService.queue.getWaitingCount()).toEqual(1);

    const standardQueueJobs = await standardQueueService.queue.getJobs();
    expect(standardQueueJobs.length).toEqual(1);
    const [standardQueueJob] = standardQueueJobs;
    expect(standardQueueJob).toMatchObject(
      expect.objectContaining({
        id: '1',
        name: jobId,
        data: jobData,
        attemptsMade: 0,
      })
    );
  });

  it('should add a minimal job in the queue', async () => {
    const jobId = 'standard-job-id-2';
    const _environmentId = 'standard-environment-id';
    const _organizationId = 'standard-organization-id';
    const _userId = 'standard-user-id';
    const jobData = {
      _id: jobId,
      test: 'standard-job-data-2',
      _environmentId,
      _organizationId,
      _userId,
    };
    await standardQueueService.addMinimalJob(jobId, jobData, _organizationId);

    expect(await standardQueueService.queue.getActiveCount()).toEqual(0);
    expect(await standardQueueService.queue.getWaitingCount()).toEqual(1);

    const standardQueueJobs = await standardQueueService.queue.getJobs();
    expect(standardQueueJobs.length).toEqual(1);
    const [standardQueueJob] = standardQueueJobs;
    expect(standardQueueJob).toMatchObject(
      expect.objectContaining({
        id: '2',
        name: jobId,
        data: {
          _id: jobId,
          _environmentId,
          _organizationId,
          _userId,
        },
        attemptsMade: 0,
      })
    );
  });
});
