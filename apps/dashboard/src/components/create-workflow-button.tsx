import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetMain,
  SheetTitle,
  SheetTrigger,
} from '@/components/primitives/sheet';
import { ExternalLink } from '@/components/shared/external-link';
import { CreateWorkflowForm } from '@/components/workflow-editor/create-workflow-form';
import { useCreateWorkflow } from '@/hooks/use-create-workflow';
import { ComponentProps, forwardRef, useState } from 'react';
import { RiArrowRightSLine } from 'react-icons/ri';
import { z } from 'zod';
import { workflowSchema } from './workflow-editor/schema';

export const CreateWorkflowButton = forwardRef<HTMLButtonElement, ComponentProps<typeof SheetTrigger>>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const { submit, isLoading: isCreating } = useCreateWorkflow({
    onSuccess: () => setIsOpen(false),
  });

  const handleSubmit = (values: z.infer<typeof workflowSchema>) => {
    submit(values);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger ref={ref} {...props} />
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Create workflow</SheetTitle>
          <div>
            <SheetDescription>
              Define the steps to notify subscribers using channels like in-app, email, and more.{' '}
              <ExternalLink href="https://docs.novu.co/concepts/workflows">Learn more</ExternalLink>
            </SheetDescription>
          </div>
        </SheetHeader>
        <Separator />
        <SheetMain>
          <CreateWorkflowForm onSubmit={handleSubmit} />
        </SheetMain>
        <Separator />
        <SheetFooter>
          <Button
            isLoading={isCreating}
            trailingIcon={RiArrowRightSLine}
            variant="secondary"
            mode="gradient"
            type="submit"
            form="create-workflow"
          >
            Create workflow
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

CreateWorkflowButton.displayName = 'CreateWorkflowButton';
