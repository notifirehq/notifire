import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';
import { IMixpanelInboxResponse, IMixpanelTriggerResponse } from '../types/usage-insights.types';

const USE_INSIGHTS_CACHE = process.env.USE_INSIGHTS_CACHE === 'true';

@Injectable()
export class MixpanelService {
  private readonly CACHE_FILE = join(process.cwd(), 'mixpanel-insights-cache.json');
  private readonly INBOX_CACHE_FILE = join(process.cwd(), 'mixpanel-inbox-cache.json');
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private async readCacheFile(cacheFile: string) {
    if (!USE_INSIGHTS_CACHE) {
      Logger.debug('Cache usage is disabled by environment variable');

      return null;
    }

    Logger.debug(`Attempting to read cache file: ${cacheFile}`);
    try {
      const fileContent = await fs.readFile(cacheFile, 'utf-8');
      const cache = JSON.parse(fileContent);

      if (cache.timestamp && Date.now() - cache.timestamp < this.CACHE_TTL) {
        Logger.debug(`Cache hit: Using data from ${cacheFile}, age: ${(Date.now() - cache.timestamp) / 1000}s`);

        return cache.data;
      }

      Logger.debug(`Cache expired for ${cacheFile}, age: ${(Date.now() - cache.timestamp) / 1000}s`);

      return null;
    } catch (error) {
      Logger.debug(`Cache miss: No valid cache found for ${cacheFile}`);

      return null;
    }
  }

  private async writeCacheFile(data: any, cacheFile: string) {
    if (!USE_INSIGHTS_CACHE) {
      Logger.debug('Cache usage is disabled by environment variable, skipping write');

      return;
    }

    Logger.debug(`Attempting to write cache file: ${cacheFile}`);
    try {
      const cache = {
        timestamp: Date.now(),
        data,
      };

      await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2));
      Logger.debug(`Cache write successful: ${cacheFile}`);
    } catch (error) {
      Logger.error(`Cache write failed for ${cacheFile}:`, error);
    }
  }

  async fetchMixpanelInsights(): Promise<IMixpanelTriggerResponse | null> {
    Logger.debug('Fetching Mixpanel insights');
    const cachedData = await this.readCacheFile(this.CACHE_FILE);
    if (cachedData) {
      return cachedData;
    }

    try {
      Logger.debug('Making Mixpanel API request for insights');
      const response = await axios.get<IMixpanelTriggerResponse>('https://mixpanel.com/api/2.0/insights', {
        params: {
          project_id: '2667883',
          bookmark_id: '68515975',
        },
        headers: {
          Authorization: `Basic ${process.env.MIXPANEL_BASIC_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      Logger.debug('Mixpanel insights fetch successful');
      await this.writeCacheFile(response.data, this.CACHE_FILE);

      return response.data;
    } catch (error) {
      Logger.error('Mixpanel insights fetch failed:', error);

      return null;
    }
  }

  async fetchInboxInsights(): Promise<IMixpanelInboxResponse | null> {
    Logger.debug('Fetching Inbox insights');
    const cachedData = await this.readCacheFile(this.INBOX_CACHE_FILE);
    if (cachedData) {
      return cachedData;
    }

    try {
      Logger.debug('Making Mixpanel API request for inbox insights');

      const response = await axios.get<IMixpanelInboxResponse>('https://mixpanel.com/api/2.0/insights', {
        params: {
          project_id: '2667883',
          bookmark_id: '68521376',
        },
        headers: {
          Authorization: `Basic ${process.env.MIXPANEL_BASIC_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      Logger.debug('Inbox insights fetch successful');
      await this.writeCacheFile(response.data, this.INBOX_CACHE_FILE);

      return response.data;
    } catch (error) {
      Logger.error('Inbox insights fetch failed:', error?.response?.data || error);

      return null;
    }
  }
}
