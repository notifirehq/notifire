import { Button } from '@/components/primitives/button';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/primitives/form/form';
import { Separator } from '@/components/primitives/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetMain,
  SheetTitle,
} from '@/components/primitives/sheet';
import { ExternalLink } from '@/components/shared/external-link';
import { useAuth } from '@/context/auth/hooks';
import { useFetchEnvironments } from '@/context/environment/hooks';
import { useCreateEnvironment } from '@/hooks/use-environments';
import { useFetchSubscription } from '@/hooks/use-fetch-subscription';
import { ROUTES } from '@/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiServiceLevelEnum, IEnvironment } from '@novu/shared';
import { ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiAddLine, RiArrowRightSLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ColorPicker } from './primitives/color-picker';
import { showErrorToast, showSuccessToast } from './primitives/sonner-helpers';
import { Tooltip, TooltipContent, TooltipTrigger } from './primitives/tooltip';

const ENVIRONMENT_COLORS = [
  '#FF6B6B', // Vibrant Coral
  '#4ECDC4', // Bright Turquoise
  '#45B7D1', // Azure Blue
  '#96C93D', // Lime Green
  '#A66CFF', // Bright Purple
  '#FF9F43', // Bright Orange
  '#FF78C4', // Hot Pink
  '#20C997', // Emerald
  '#845EC2', // Royal Purple
  '#FF5E78', // Bright Red
] as const;

function getRandomColor(existingEnvironments: IEnvironment[] = []) {
  const usedColors = new Set(existingEnvironments.map((env) => (env as any).color).filter(Boolean));
  const availableColors = ENVIRONMENT_COLORS.filter((color) => !usedColors.has(color));

  // If all colors are used, fall back to the original list
  const colorPool = availableColors.length > 0 ? availableColors : ENVIRONMENT_COLORS;

  return colorPool[Math.floor(Math.random() * colorPool.length)];
}

const createEnvironmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string(),
});

type CreateEnvironmentFormData = z.infer<typeof createEnvironmentSchema>;

type CreateEnvironmentButtonProps = ComponentProps<typeof Button>;

export const CreateEnvironmentButton = (props: CreateEnvironmentButtonProps) => {
  const { currentOrganization } = useAuth();
  const { environments = [] } = useFetchEnvironments({ organizationId: currentOrganization?._id });
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateEnvironment();
  const { subscription } = useFetchSubscription();
  const navigate = useNavigate();

  const isBusinessTier = subscription?.apiServiceLevel === ApiServiceLevelEnum.BUSINESS;
  const isTrialActive = subscription?.trial?.isActive;
  const canCreateEnvironment = isBusinessTier && !isTrialActive;

  const form = useForm<CreateEnvironmentFormData>({
    resolver: zodResolver(createEnvironmentSchema),
    defaultValues: {
      name: '',
      color: getRandomColor(environments),
    },
  });

  const onSubmit = async (values: CreateEnvironmentFormData) => {
    try {
      await mutateAsync({
        name: values.name,
        color: values.color,
      });

      setIsOpen(false);

      form.reset({
        name: '',
        color: getRandomColor(environments),
      });

      showSuccessToast('Environment created successfully');
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Failed to create environment';
      showErrorToast(Array.isArray(message) ? message[0] : message);
    }
  };

  const handleClick = () => {
    if (!canCreateEnvironment) {
      navigate(ROUTES.SETTINGS_BILLING);
      return;
    }

    setIsOpen(true);
  };

  const getTooltipContent = () => {
    if (!canCreateEnvironment) {
      return 'Upgrade to Business plan to create custom environments';
    }

    return '';
  };

  const button = (
    <Button mode="gradient" variant="primary" size="xs" leadingIcon={RiAddLine} onClick={handleClick} {...props}>
      Create environment
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {canCreateEnvironment ? (
        button
      ) : (
        <Tooltip>
          <TooltipTrigger>{button}</TooltipTrigger>
          <TooltipContent>{getTooltipContent()}</TooltipContent>
        </Tooltip>
      )}

      {canCreateEnvironment && (
        <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader>
            <SheetTitle>Create environment</SheetTitle>
            <div>
              <SheetDescription>
                Create a new environment to manage your notifications.{' '}
                <ExternalLink href="https://docs.novu.co/concepts/environments">Learn more</ExternalLink>
              </SheetDescription>
            </div>
          </SheetHeader>
          <Separator />
          <SheetMain>
            <Form {...form}>
              <form
                id="create-environment"
                autoComplete="off"
                noValidate
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Name</FormLabel>
                      <FormControl>
                        <FormInput
                          {...field}
                          autoFocus
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Color</FormLabel>
                      <FormControl>
                        <ColorPicker pureInput={false} value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage>Will be used to identify the environment in the UI.</FormMessage>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </SheetMain>
          <Separator />
          <SheetFooter>
            <Button
              isLoading={isPending}
              trailingIcon={RiArrowRightSLine}
              variant="secondary"
              mode="gradient"
              type="submit"
              form="create-environment"
            >
              Create environment
            </Button>
          </SheetFooter>
        </SheetContent>
      )}
    </Sheet>
  );
};
