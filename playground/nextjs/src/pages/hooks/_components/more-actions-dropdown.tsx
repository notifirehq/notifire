'use-client';

import { useNovu } from '@novu/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu/dropdown-menu';
import { cn } from '../../../utils/tw';
import { buttonVariants } from './button';
import { Archive, ArchiveRead, Dots, ReadAll } from './icons';
import { StatusItem } from './status-dropdown';

export const MoreActionsDropdown = () => {
  const novu = useNovu();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'unstyled', size: 'none' }), 'gap-2')}>
        <Dots />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#f5f5f4] text-[#726F77] min-w-content">
        <StatusItem onClick={() => novu.notifications.readAll()} icon={<ReadAll />} label={'Mark all as read'} />
        <StatusItem onClick={() => novu.notifications.archiveAll()} icon={<Archive />} label={'Archive all'} />
        <StatusItem onClick={() => novu.notifications.archiveAllRead()} icon={<ArchiveRead />} label={'Archive read'} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
