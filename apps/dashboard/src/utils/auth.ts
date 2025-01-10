import { MODE } from '@/config';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Clerk {
  export const session: {
    getToken: () => Promise<string | null>;
  };
}

export async function getToken(): Promise<string> {
  if (MODE === 'test') {
    return localStorage.getItem('nv_auth_token') ?? '';
  }

  return (await Clerk.session?.getToken()) || '';
}
