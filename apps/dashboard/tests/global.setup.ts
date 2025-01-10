import path from 'path';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

const authFile = path.join(__dirname, '../playwright/.clerk/user.json');

setup('global setup', async ({ page }) => {
  await clerkSetup();

  /**
   * TODO: Currently we are running tests with a single Clerk user and organization.
   * This approach has a drawback that the tests are not independent from each other and write the data to the same organization.
   * We should consider creating a new Clerk user and organization for each test using the @clerk/backend package.
   * Then initialize the BE session with the new Clerk user and organization and update Clerk user metadata from the newly created session.
   */
  if (!process.env.CLERK_USER_USERNAME || !process.env.CLERK_USER_PASSWORD) {
    throw new Error('Please provide CLERK_USER_USERNAME and CLERK_USER_PASSWORD environment variables.');
  }

  await page.goto('/');
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.CLERK_USER_USERNAME!,
      password: process.env.CLERK_USER_PASSWORD!,
    },
  });

  await page.goto('/');

  await page.context().storageState({ path: authFile });
});
