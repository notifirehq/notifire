/* eslint-disable global-require */
import { CommunityOrganizationRepository, CommunityUserRepository, CommunityMemberRepository } from '@novu/dal';
import { isClerkEnabled } from '@novu/shared';

/**
 * We are using nx-ignore-next-line as a workaround here to avoid following circular dependency error:
 * @novu/application-generic:build --> @novu/testing:build --> @novu/ee-auth:build --> @novu/application-generic:build
 *
 * When revising EE testing, we should consider refactoring the code to potentially avoid this circular dependency.
 *
 */
export function getEERepository<T>(className: 'OrganizationRepository' | 'MemberRepository' | 'UserRepository'): T {
  if (isClerkEnabled()) {
    switch (className) {
      case 'OrganizationRepository':
        return getEEOrganizationRepository();
      case 'MemberRepository':
        return getEEMemberRepository();
      case 'UserRepository':
        return getEEUserRepository();
      default:
        throw new Error('Invalid repository name');
    }
  }

  switch (className) {
    case 'OrganizationRepository':
      return new CommunityOrganizationRepository() as T;
    case 'MemberRepository':
      return new CommunityMemberRepository() as T;
    case 'UserRepository':
      return new CommunityUserRepository() as T;
    default:
      throw new Error('Invalid repository name');
  }
}

export function getEEUserRepository({ mockClerkClient = true }: { mockClerkClient?: boolean } = {}) {
  // nx-ignore-next-line
  const enterpriseModule = require('@novu/ee-auth');
  const EnterpriseUserRepository = enterpriseModule?.EEUserRepository;

  if (mockClerkClient) {
    const ClerkClientMock = enterpriseModule?.ClerkClientMock;

    return new EnterpriseUserRepository(new CommunityUserRepository(), new ClerkClientMock());
  }

  return new EnterpriseUserRepository(new CommunityUserRepository());
}

export function getEEOrganizationRepository({ mockClerkClient = true }: { mockClerkClient?: boolean } = {}) {
  // nx-ignore-next-line
  const enterpriseModule = require('@novu/ee-auth');
  const EEOrganizationRepository = enterpriseModule?.EEOrganizationRepository;
  if (mockClerkClient) {
    const ClerkClientMock = enterpriseModule?.ClerkClientMock;

    return new EEOrganizationRepository(new CommunityOrganizationRepository(), new ClerkClientMock());
  }

  return new EEOrganizationRepository(new CommunityOrganizationRepository());
}

export function getEEMemberRepository({ mockClerkClient = true }: { mockClerkClient?: boolean } = {}) {
  // nx-ignore-next-line
  const enterpriseModule = require('@novu/ee-auth');
  const EEMemberRepository = enterpriseModule?.EEMemberRepository;

  if (mockClerkClient) {
    const ClerkClientMock = enterpriseModule?.ClerkClientMock;

    return new EEMemberRepository(new CommunityOrganizationRepository(), new ClerkClientMock());
  }

  return new EEMemberRepository(new CommunityOrganizationRepository());
}
