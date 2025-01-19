import { Button } from '@/components/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/dialog';
import { IEnvironment } from '@novu/shared';

interface DeleteEnvironmentDialogProps {
  environment?: IEnvironment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteEnvironmentDialog = ({
  environment,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteEnvironmentDialogProps) => {
  if (!environment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Environment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the environment <span className="font-bold">{environment.name}</span>?{' '}
            <br /> This action cannot be undone and it will break all the integrations that are using this environment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" mode="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="error" mode="gradient" onClick={onConfirm} isLoading={isLoading}>
            Delete {environment.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
