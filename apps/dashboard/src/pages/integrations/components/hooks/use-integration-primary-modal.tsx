import { useState } from 'react';
import { CHANNELS_WITH_PRIMARY, IIntegration, ChannelTypeEnum } from '@novu/shared';
import { IntegrationFormData } from '../../types';
import { handleIntegrationError } from '../utils/handle-integration-error';
import { UseMutateAsyncFunction } from '@tanstack/react-query';

type SetPrimaryIntegrationParams = {
  integrationId: string;
};

type UseIntegrationPrimaryModalProps = {
  onSubmit: (data: IntegrationFormData, skipPrimaryCheck?: boolean) => Promise<void>;
  integrations?: IIntegration[];
  integration?: IIntegration;
  channel?: ChannelTypeEnum;
  mode: 'create' | 'update';
  setPrimaryIntegration?: UseMutateAsyncFunction<unknown, Error, SetPrimaryIntegrationParams>;
};

export function useIntegrationPrimaryModal({
  onSubmit,
  integrations = [],
  integration,
  channel,
  mode,
  setPrimaryIntegration,
}: UseIntegrationPrimaryModalProps) {
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<IntegrationFormData | null>(null);

  const currentChannel = integration?.channel ?? channel ?? ChannelTypeEnum.EMAIL;
  const currentEnvironmentId = integration?._environmentId;

  const isChannelSupportPrimary = CHANNELS_WITH_PRIMARY.includes(currentChannel);
  const filteredIntegrations = integrations.filter(
    (el) =>
      el.channel === currentChannel &&
      el._environmentId === currentEnvironmentId &&
      (mode === 'update' ? el._id !== integration?._id : true)
  );

  const existingPrimaryIntegration = filteredIntegrations.find((el) => el.primary);
  const hasOtherProviders = filteredIntegrations.length;

  const shouldShowPrimaryModal = (data: IntegrationFormData) => {
    if (!channel && !integration) return false;
    if (!isChannelSupportPrimary) return false;

    const hasSameChannelActiveIntegration = filteredIntegrations.find((el) => el.active);

    return data.active && data.primary && hasSameChannelActiveIntegration && existingPrimaryIntegration;
  };

  const handleSubmitWithPrimaryCheck = async (data: IntegrationFormData) => {
    if (shouldShowPrimaryModal(data)) {
      setIsPrimaryModalOpen(true);
      setPendingData(data);

      return;
    }

    await onSubmit(data);
  };

  const handlePrimaryConfirm = async (newPrimaryIntegrationId?: string) => {
    if (!pendingData) {
      setIsPrimaryModalOpen(false);

      return;
    }

    try {
      if (newPrimaryIntegrationId && setPrimaryIntegration) {
        await setPrimaryIntegration({ integrationId: newPrimaryIntegrationId });
      } else {
        await onSubmit(pendingData, true);
      }
      setPendingData(null);
      setIsPrimaryModalOpen(false);
    } catch (error: unknown) {
      handleIntegrationError(error, mode);
    }
  };

  return {
    isPrimaryModalOpen,
    setIsPrimaryModalOpen,
    isChannelSupportPrimary,
    pendingData,
    setPendingData,
    handleSubmitWithPrimaryCheck,
    handlePrimaryConfirm,
    existingPrimaryIntegration,
    hasOtherProviders,
  };
}