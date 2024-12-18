import { Button } from '@/components/primitives/button';
import { SheetHeader, SheetTitle } from '@/components/primitives/sheet';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { IProviderConfig } from '@novu/shared';
import { ProviderIcon } from './provider-icon';

type IntegrationSheetHeaderProps = {
  provider?: IProviderConfig;
  mode: 'create' | 'update';
  onBack?: () => void;
  step?: 'select' | 'configure';
};

export function IntegrationSheetHeader({ provider, mode, onBack, step }: IntegrationSheetHeaderProps) {
  if (mode === 'create' && step === 'select') {
    return (
      <SheetHeader className="borde-neutral-300 space-y-1 border-b p-3">
        <SheetTitle className="text-lg">Connect Integration</SheetTitle>
        <p className="text-foreground-400 text-xs">
          Select an integration to connect with your application.{' '}
          <a href="https://docs.novu.co/docs/integrations" target="_blank" className="underline">
            Learn More
          </a>
        </p>
      </SheetHeader>
    );
  }

  if (!provider) return null;

  return (
    <SheetHeader className="borde-neutral-300 space-y-1 border-b p-3">
      <div className="flex items-center gap-2">
        {mode === 'create' && onBack && (
          <Button variant="ghost" size="xs" className="text-foreground-950 h-5 p-0.5 leading-none" onClick={onBack}>
            <RiArrowLeftSLine className="h-4 w-4" />
          </Button>
        )}
        <div>
          <ProviderIcon providerId={provider.id} providerDisplayName={provider.displayName} />
        </div>
        <div className="text-md text-foreground-950 leading-6">{provider.displayName}</div>
      </div>
    </SheetHeader>
  );
}