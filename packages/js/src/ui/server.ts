import { Accessor, ComponentProps, Setter } from 'solid-js';
import { MountableElement } from 'solid-js/web';
import { Appearance, Localization, NovuProviderProps, PreferencesFilter, RouterPush, Tab } from './types';
import { NovuComponentName, novuComponents } from './components/Renderer';
import { NovuOptions } from '../types';

export type { Notification } from '../notifications';
export type { InboxPage, InboxProps } from './components';
export type { BaseNovuUIOptions, NovuUIOptions } from './novuUI';
export * from './types';

export class NovuUI {
  #dispose: { (): void } | null = null;
  #rootElement: HTMLElement;
  #tabs: Accessor<Array<Tab>>;
  #routerPush: Accessor<RouterPush | undefined>;
  #setRouterPush: Setter<RouterPush | undefined>;
  #preferencesFilter: Accessor<PreferencesFilter | undefined>;
  #setPreferencesFilter: Setter<PreferencesFilter | undefined>;
  id: string;

  /* eslint-disable  @typescript-eslint/no-useless-constructor */
  /* eslint-disable    @typescript-eslint/no-empty-function */
  constructor(props: NovuProviderProps) {}

  mountComponent<T extends NovuComponentName>({
    name,
    element,
    props: componentProps,
  }: {
    name: T;
    element: MountableElement;
    props?: ComponentProps<(typeof novuComponents)[T]>;
  }) {}

  unmountComponent(element: MountableElement) {}

  updateAppearance(appearance?: Appearance) {}

  updateLocalization(localization?: Localization) {}

  updateOptions(options: NovuOptions) {}

  updateTabs(tabs?: Array<Tab>) {}

  updatePreferencesFilter(preferencesFilter?: PreferencesFilter) {}

  updateRouterPush(routerPush?: RouterPush) {}

  unmount(): void {}
}
