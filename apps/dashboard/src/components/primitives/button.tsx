import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { IconType } from 'react-icons';
import { RiLoader4Line } from 'react-icons/ri';

import type { PolymorphicComponentProps } from '@/utils/polymorphic';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/ui';

const BUTTON_ROOT_NAME = 'ButtonRoot';
const BUTTON_ICON_NAME = 'ButtonIcon';

export const buttonVariants = tv({
  slots: {
    root: [
      // base
      'group select-none relative inline-flex items-center justify-center whitespace-nowrap outline-none',
      'transition duration-200 ease-out',
      // focus
      'focus:outline-none',
      // disabled
      'disabled:pointer-events-none [&:disabled:not(.loading)]:bg-bg-weak [&:disabled:not(.loading)]:text-text-disabled [&:disabled:not(.loading)]:ring-transparent',
    ],
    icon: [
      // base
      'flex size-5 shrink-0 items-center justify-center',
    ],
  },
  variants: {
    variant: {
      primary: {},
      secondary: {},
      error: {},
    },
    mode: {
      filled: {},
      outline: {
        root: 'ring-1 ring-inset',
      },
      lighter: {
        root: 'ring-1 ring-inset',
      },
      ghost: {
        root: 'ring-1 ring-inset',
      },
    },
    size: {
      md: {
        root: 'h-10 gap-3 rounded-10 px-3.5 text-label-sm',
        icon: '',
      },
      sm: {
        root: 'h-9 gap-3 rounded-lg px-3 text-label-sm',
        icon: '',
      },
      xs: {
        root: 'h-8 gap-2.5 rounded-lg px-2.5 text-label-xs',
        icon: '',
      },
      '2xs': {
        root: 'h-7 gap-2.5 rounded-lg px-2 text-label-xs',
        icon: '',
      },
    },
  },
  compoundVariants: [
    //#region variant=primary
    {
      variant: 'primary',
      mode: 'filled',
      class: {
        root: [
          // base
          'bg-primary-base text-static-white',
          // hover
          'hover:bg-primary-darker',
          // focus
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'outline',
      class: {
        root: [
          // base
          'bg-bg-white text-primary-base ring-primary-base',
          // hover
          'hover:bg-primary-alpha-10 hover:ring-transparent',
          // focus
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'lighter',
      class: {
        root: [
          // base
          'bg-primary-alpha-10 text-primary-base ring-transparent',
          // hover
          'hover:bg-bg-white hover:ring-primary-base',
          // focus
          'focus-visible:bg-bg-white focus-visible:shadow-button-primary-focus focus-visible:ring-primary-base',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'ghost',
      class: {
        root: [
          // base
          'bg-transparent text-primary-base ring-transparent',
          // hover
          'hover:bg-primary-alpha-10',
          // focus
          'focus-visible:bg-bg-white focus-visible:shadow-button-primary-focus focus-visible:ring-primary-base',
        ],
      },
    },
    //#endregion

    //#region variant=neutral
    {
      variant: 'secondary',
      mode: 'filled',
      class: {
        root: [
          // base
          'bg-bg-strong text-text-white',
          // hover
          'hover:bg-bg-surface',
          // focus
          'focus-visible:shadow-button-important-focus',
        ],
      },
    },
    {
      variant: 'secondary',
      mode: 'outline',
      class: {
        root: [
          // base
          'bg-bg-white text-text-sub shadow-regular-xs ring-stroke-soft',
          // hover
          'hover:bg-bg-weak hover:text-text-strong hover:shadow-none hover:ring-transparent',
          // focus
          'focus-visible:text-text-strong focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong',
        ],
      },
    },
    {
      variant: 'secondary',
      mode: 'lighter',
      class: {
        root: [
          // base
          'bg-bg-weak text-text-sub ring-transparent',
          // hover
          'hover:bg-bg-white hover:text-text-strong hover:shadow-regular-xs hover:ring-stroke-soft',
          // focus
          'focus-visible:bg-bg-white focus-visible:text-text-strong focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong',
        ],
      },
    },
    {
      variant: 'secondary',
      mode: 'ghost',
      class: {
        root: [
          // base
          'bg-transparent text-text-sub ring-transparent',
          // hover
          'hover:bg-bg-weak hover:text-text-strong',
          // focus
          'focus-visible:bg-bg-white focus-visible:text-text-strong focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong',
        ],
      },
    },
    //#endregion

    //#region variant=error
    {
      variant: 'error',
      mode: 'filled',
      class: {
        root: [
          // base
          'bg-error-base text-static-white',
          // hover
          'hover:bg-red-700',
          // focus
          'focus-visible:shadow-button-error-focus',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'outline',
      class: {
        root: [
          // base
          'bg-bg-white text-error-base ring-error-base',
          // hover
          'hover:bg-red-alpha-10 hover:ring-transparent',
          // focus
          'focus-visible:shadow-button-error-focus',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'lighter',
      class: {
        root: [
          // base
          'bg-red-alpha-10 text-error-base ring-transparent',
          // hover
          'hover:bg-bg-white hover:ring-error-base',
          // focus
          'focus-visible:bg-bg-white focus-visible:shadow-button-error-focus focus-visible:ring-error-base',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'ghost',
      class: {
        root: [
          // base
          'bg-transparent text-error-base ring-transparent',
          // hover
          'hover:bg-red-alpha-10',
          // focus
          'focus-visible:bg-bg-white focus-visible:shadow-button-error-focus focus-visible:ring-error-base',
        ],
      },
    },
    //#endregion
  ],
  defaultVariants: {
    variant: 'primary',
    mode: 'filled',
    size: 'sm',
  },
});

type ButtonSharedProps = VariantProps<typeof buttonVariants>;

export type ButtonRootProps = VariantProps<typeof buttonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isLoading?: boolean;
  };

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  ({ children, variant, mode, size, asChild, isLoading, className, disabled, ...rest }, forwardedRef) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';
    const { root } = buttonVariants({ variant, mode, size });

    const sharedProps: ButtonSharedProps = {
      variant,
      mode,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [BUTTON_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={root({
          class: cn(
            'relative flex items-center justify-center gap-1',
            className,
            isLoading && ['animate-pulse-subtle duration-2000', 'loading']
          ),
        })}
        type="button"
        disabled={disabled || isLoading}
        {...rest}
      >
        {extendedChildren}
        {isLoading && (
          <div className="animate-in zoom-in-50 fade-in absolute inset-0 flex w-full items-center justify-center rounded-lg text-current backdrop-blur duration-300">
            <RiLoader4Line className="size-4 animate-spin" />
          </div>
        )}
      </Component>
    );
  }
);
ButtonRoot.displayName = BUTTON_ROOT_NAME;

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof ButtonRoot> & {
    leadingIcon?: IconType;
    trailingIcon?: IconType;
  }
>(({ children, leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, ...rest }, forwardedRef) => {
  return (
    <ButtonRoot ref={forwardedRef} {...rest}>
      {LeadingIcon && <ButtonIcon as={LeadingIcon} />}
      <Slottable>{children}</Slottable>
      {TrailingIcon && <ButtonIcon as={TrailingIcon} />}
    </ButtonRoot>
  );
});
Button.displayName = 'Button';

function ButtonIcon<T extends React.ElementType>({
  variant,
  mode,
  size,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, ButtonSharedProps>) {
  const Component = as || 'div';
  const { icon } = buttonVariants({ mode, variant, size });

  return <Component className={icon({ class: className })} {...rest} />;
}
ButtonIcon.displayName = BUTTON_ICON_NAME;

export { ButtonRoot as Root, ButtonIcon as ButtonIcon, Button };
