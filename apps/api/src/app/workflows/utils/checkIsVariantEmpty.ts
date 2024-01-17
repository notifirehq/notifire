import { NotificationStepVariant } from '../usecases/create-notification-template';

/** determine if the variant has no filters / conditions */
export const checkIsVariantEmpty = (variant: NotificationStepVariant): boolean => {
  return Boolean(!variant.filters?.length || variant.filters.some((filter) => !filter.children?.length));
};
