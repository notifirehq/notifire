import { type Page } from '@playwright/test';
import { DalService } from '@novu/dal';
import { UserSession } from '@novu/testing';

export async function initializeSession({ page }: { page: Page }): Promise<UserSession> {
  if (!process.env.MONGO_URL) {
    throw new Error('Please provide MONGO_URL environment variable.');
  }
  if (!process.env.API_URL) {
    throw new Error('Please provide API_URL environment variable.');
  }
  if (!process.env.CLERK_EXTERNAL_USER_ID || !process.env.CLERK_EXTERNAL_ORG_ID) {
    throw new Error('Please provide CLERK_EXTERNAL_USER_ID and CLERK_EXTERNAL_ORG_ID environment variables.');
  }

  const dal = new DalService();
  await dal.connect(process.env.MONGO_URL ?? '');

  const session = new UserSession(process.env.API_URL);
  await session.initialize({
    ee: {
      userId: process.env.CLERK_EXTERNAL_USER_ID as any,
      orgId: process.env.CLERK_EXTERNAL_ORG_ID as any,
      mockClerkClient: false,
    },
  });

  const sessionData = {
    token: session.token.split(' ')[1],
    user: session.user,
    organization: session.organization,
    environment: session.environment,
  };

  /*
   * Why is this necessary?
   *
   * Most Playwright tests, create a sessions using some utility functions. The session
   * is injected in the test, but also needs to be injected in the browser storage, so that
   * the app can work as expected. Currently, the apps shares token and environment information
   * between React hooks and the api.client.ts via the localStorage. This needs to be revised
   * in favor of an in-memory approach.
   */
  await page.addInitScript((currentSession) => {
    window.addEventListener('DOMContentLoaded', () => {
      localStorage.setItem('nv_auth_token', currentSession.token);
    });
  }, sessionData);

  await page.goto('/');

  return session;
}
