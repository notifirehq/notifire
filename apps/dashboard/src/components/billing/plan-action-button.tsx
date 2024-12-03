import { Button } from '@/components/primitives/button';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useMutation } from '@tanstack/react-query';
import { get, post } from '../../api/api.client';
import { toast } from 'sonner';
import { useSubscription } from './hooks/use-subscription';
import { cn } from '../../utils/ui';
import { ChevronRight } from 'lucide-react';

interface PlanActionButtonProps {
  selectedBillingInterval: 'month' | 'year';
  variant?: 'default' | 'outline';
  showIcon?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function PlanActionButton({
  selectedBillingInterval,
  variant = 'default',
  showIcon = false,
  className,
  size = 'default',
}: PlanActionButtonProps) {
  const { data: subscription } = useSubscription();
  const { trial, apiServiceLevel } = subscription || {};
  const isPaidSubscriptionActive =
    subscription?.isActive && !trial?.isActive && apiServiceLevel !== ApiServiceLevelEnum.FREE;

  const { mutateAsync: goToPortal, isPending: isGoingToPortal } = useMutation({
    mutationFn: () => get<{ data: string }>('/billing/portal?isV2Dashboard=true'),
    onSuccess: (data) => {
      window.location.href = data.data;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unexpected error occurred');
    },
  });

  const { mutateAsync: checkout, isPending: isCheckingOut } = useMutation({
    mutationFn: () =>
      post<{ data: { stripeCheckoutUrl: string } }>('/billing/checkout-session', {
        billingInterval: selectedBillingInterval,
        apiServiceLevel: ApiServiceLevelEnum.BUSINESS,
        isV2Dashboard: true,
      }),
    onSuccess: (data) => {
      window.location.href = data.data.stripeCheckoutUrl;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unexpected error occurred');
    },
  });

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
      onClick={() => (isPaidSubscriptionActive ? goToPortal() : checkout())}
      disabled={isGoingToPortal || isCheckingOut}
    >
      {isPaidSubscriptionActive ? 'Manage subscription' : 'Upgrade plan'}
      {showIcon && <ChevronRight className="h-4 w-4" />}
    </Button>
  );
}
