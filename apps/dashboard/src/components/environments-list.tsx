import { useAuth } from '@/context/auth/hooks';
import { useEnvironment, useFetchEnvironments } from '@/context/environment/hooks';
import { useDeleteEnvironment } from '@/hooks/use-environments';
import { cn } from '@/utils/ui';
import { IEnvironment } from '@novu/shared';
import { useState } from 'react';
import { RiDeleteBin2Line, RiMore2Fill } from 'react-icons/ri';
import { DeleteEnvironmentDialog } from './delete-environment-dialog';
import { EditEnvironmentSheet } from './edit-environment-sheet';
import { Badge } from './primitives/badge';
import { CompactButton } from './primitives/button-compact';
import { CopyButton } from './primitives/copy-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './primitives/dropdown-menu';
import { EnvironmentBranchIcon } from './primitives/environment-branch-icon';
import { Skeleton } from './primitives/skeleton';
import { showErrorToast, showSuccessToast } from './primitives/sonner-helpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './primitives/table';
import { TimeDisplayHoverCard } from './time-display-hover-card';
import TruncatedText from './truncated-text';

const PROTECTED_ENVIRONMENTS = ['Development', 'Production'];

const EnvironmentRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell className="w-1">
      <Skeleton className="size-8 rounded-md" />
    </TableCell>
  </TableRow>
);

export function EnvironmentsList() {
  const { currentOrganization } = useAuth();
  const { environments = [], areEnvironmentsInitialLoading } = useFetchEnvironments({
    organizationId: currentOrganization?._id,
  });
  const { currentEnvironment } = useEnvironment();
  const [editEnvironment, setEditEnvironment] = useState<IEnvironment>();
  const [deleteEnvironment, setDeleteEnvironment] = useState<IEnvironment>();
  const { mutateAsync: deleteEnvironmentAction, isPending: isDeletePending } = useDeleteEnvironment();

  const onDeleteEnvironment = async () => {
    if (!deleteEnvironment) return;

    try {
      await deleteEnvironmentAction({ environment: deleteEnvironment });
      showSuccessToast('Environment deleted successfully');

      setDeleteEnvironment(undefined);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Failed to delete environment';
      showErrorToast(Array.isArray(message) ? message[0] : message);
    }
  };

  const handleDeleteClick = (environment: IEnvironment) => {
    setDeleteEnvironment(environment);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Identifier</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-1"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areEnvironmentsInitialLoading
            ? Array.from({ length: 3 }).map((_, i) => <EnvironmentRowSkeleton key={i} />)
            : environments.map((environment) => (
                <TableRow key={environment._id} className="group relative isolate">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <EnvironmentBranchIcon size="sm" environment={environment} />
                      <div className="flex items-center gap-1">
                        <TruncatedText className="max-w-[32ch]">{environment.name}</TruncatedText>
                        {environment._id === currentEnvironment?._id && (
                          <Badge color="blue" size="sm" variant="lighter">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 transition-opacity duration-200">
                      <TruncatedText className="text-foreground-400 font-code block text-xs">
                        {environment.identifier}
                      </TruncatedText>
                      <CopyButton
                        className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
                        valueToCopy={environment.identifier}
                        size="2xs"
                        mode="ghost"
                      />
                    </div>
                  </TableCell>
                  <TableCell className={cn('text-foreground-600 min-w-[180px] text-sm font-medium')}>
                    <TimeDisplayHoverCard date={new Date(environment.updatedAt)}>
                      {new Date(environment.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TimeDisplayHoverCard>
                  </TableCell>
                  <TableCell className="h-[49px] w-1">
                    {!PROTECTED_ENVIRONMENTS.includes(environment.name) && (
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <CompactButton
                            icon={RiMore2Fill}
                            variant="ghost"
                            className="z-10 h-8 w-8 p-0"
                          ></CompactButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => setEditEnvironment(environment)}>
                              Edit environment
                            </DropdownMenuItem>
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => handleDeleteClick(environment)}
                                disabled={
                                  environment._id === currentEnvironment?._id ||
                                  PROTECTED_ENVIRONMENTS.includes(environment.name)
                                }
                              >
                                <RiDeleteBin2Line />
                                Delete environment
                              </DropdownMenuItem>
                            </>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <EditEnvironmentSheet
        environment={editEnvironment}
        isOpen={!!editEnvironment}
        onOpenChange={(open) => !open && setEditEnvironment(undefined)}
      />
      <DeleteEnvironmentDialog
        environment={deleteEnvironment}
        open={!!deleteEnvironment}
        onOpenChange={(open) => !open && setDeleteEnvironment(undefined)}
        onConfirm={onDeleteEnvironment}
        isLoading={isDeletePending}
      />
    </>
  );
}
