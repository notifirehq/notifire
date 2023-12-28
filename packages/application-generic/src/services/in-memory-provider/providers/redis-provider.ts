import { convertStringValues } from './variable-mappers';

import {
  ConnectionOptions,
  IRedisConfigOptions,
  Redis,
  RedisOptions,
  ScanStream,
} from '../types';

export const CLIENT_READY = 'ready';
const DEFAULT_TTL_SECONDS = 60 * 60 * 2;
const DEFAULT_CONNECT_TIMEOUT = 50000;
const DEFAULT_HOST = 'localhost';
const DEFAULT_KEEP_ALIVE = 30000;
const DEFAULT_KEY_PREFIX = '';
const DEFAULT_FAMILY = 4;
const DEFAULT_PORT = 6379;

interface IRedisConfig {
  db?: string;
  connectTimeout?: string;
  family?: string;
  host?: string;
  keepAlive?: string;
  keyPrefix?: string;
  password?: string;
  port?: string;
  tls?: ConnectionOptions;
  ttl?: string;
}

export interface IRedisProviderConfig {
  db?: number;
  connectTimeout: number;
  family: number;
  host?: string;
  keepAlive: number;
  keyPrefix: string;
  username?: string;
  options?: IRedisConfigOptions;
  password?: string;
  port?: number;
  tls?: ConnectionOptions;
  ttl: number;
}

export const getRedisProviderConfig = (
  options?: IRedisConfigOptions
): IRedisProviderConfig => {
  const redisConfig: IRedisConfig = {
    db: convertStringValues(process.env.REDIS_DB_INDEX),
    host: convertStringValues(process.env.REDIS_HOST),
    port: convertStringValues(process.env.REDIS_PORT),
    ttl: convertStringValues(process.env.REDIS_TTL),
    password: convertStringValues(process.env.REDIS_PASSWORD),
    connectTimeout: convertStringValues(process.env.REDIS_CONNECT_TIMEOUT),
    keepAlive: convertStringValues(process.env.REDIS_KEEP_ALIVE),
    family: convertStringValues(process.env.REDIS_FAMILY),
    keyPrefix: convertStringValues(process.env.REDIS_PREFIX),
    tls: process.env.REDIS_TLS as ConnectionOptions,
  };

  const db = redisConfig.db ? Number(redisConfig.db) : undefined;
  const port = redisConfig.port ? Number(redisConfig.port) : DEFAULT_PORT;
  const host = redisConfig.host || DEFAULT_HOST;
  const password = redisConfig.password;
  const connectTimeout = redisConfig.connectTimeout
    ? Number(redisConfig.connectTimeout)
    : DEFAULT_CONNECT_TIMEOUT;
  const family = redisConfig.family
    ? Number(redisConfig.family)
    : DEFAULT_FAMILY;
  const keepAlive = redisConfig.keepAlive
    ? Number(redisConfig.keepAlive)
    : DEFAULT_KEEP_ALIVE;
  const keyPrefix = redisConfig.keyPrefix ?? DEFAULT_KEY_PREFIX;
  const ttl = redisConfig.ttl ? Number(redisConfig.ttl) : DEFAULT_TTL_SECONDS;
  const tls = redisConfig.tls;

  return {
    db,
    host,
    port,
    password,
    connectTimeout,
    family,
    keepAlive,
    keyPrefix,
    ttl,
    tls,
    ...(options && { options }),
  };
};

export const getRedisInstance = (
  config: IRedisProviderConfig
): Redis | undefined => {
  const { port, host, options, ...configRest } = config;
  const { showFriendlyErrorStack } = options || {};

  const redisOptions = {
    maxRetriesPerRequest: null,
    ...configRest,
    showFriendlyErrorStack,
  };

  if (port && host) {
    return new Redis(port, host, redisOptions);
  }

  return undefined;
};

export const validateRedisProviderConfig = (
  config: IRedisProviderConfig
): boolean => {
  return !!config.host && !!config.port;
};

export const isClientReady = (status: string): boolean =>
  status === CLIENT_READY;
