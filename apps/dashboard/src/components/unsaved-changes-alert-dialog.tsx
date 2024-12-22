import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/primitives/alert-dialog';
import { buttonVariants } from '@/components/primitives/legacy-button';
import { Separator } from '@/components/primitives/separator';
import { RiAlertFill } from 'react-icons/ri';
import { Blocker } from 'react-router-dom';

type UnsavedChangesAlertDialogProps = {
  blocker: Blocker;
  description?: string;
};

export const UnsavedChangesAlertDialog = (props: UnsavedChangesAlertDialogProps) => {
  const { blocker } = props;

  return (
    <AlertDialog open={blocker.state === 'blocked'}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-start gap-4">
          <div className="bg-warning/10 rounded-lg p-3">
            <RiAlertFill className="text-warning size-6" />
          </div>
          <div className="space-y-1">
            <AlertDialogTitle>You might lose your progress</AlertDialogTitle>
            <AlertDialogDescription>
              This form has some unsaved changes. Save progress before you leave.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <Separator />

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset?.()}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => blocker.proceed?.()} className={buttonVariants({ variant: 'destructive' })}>
            Proceed anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
