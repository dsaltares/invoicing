import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import cn from 'classnames';
import Link from 'next/link';
import type { IconProp } from './Icons/types';
import Icon from './Icons/Icon';

type ButtonProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    color?: 'primary' | 'secondary' | 'tertiary';
    variant?: 'solid' | 'light' | 'outlined' | 'borderless';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    startIcon?: IconProp;
    endIcon?: IconProp;
    href: string;
  }
>;

const LinkButton = ({
  color = 'primary',
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  children,
  startIcon,
  endIcon,
  href,
  ...anchorProps
}: ButtonProps) => {
  const iconClassName = cn({
    'text-xs w-3 h-3': size === 'sm',
    'text-base w-4 h-4': size !== 'sm',
  });

  return (
    <div
      className={cn('flex', {
        'w-full': fullWidth,
      })}
    >
      <Link
        href={href}
        className={cn('rounded-md text-base focus-ring text-left', {
          'bg-violet-700 text-zinc-50 hover:bg-violet-900':
            color === 'primary' && variant === 'solid',
          'bg-violet-100 text-violet-900 hover:bg-violet-300':
            color === 'primary' && variant === 'light',
          'bg-white text-violet-800 border border-violet-800 hover:bg-violet-100':
            color === 'primary' && variant === 'outlined',
          'bg-transparent text-violet-800 underline hover:bg-violet-100':
            color === 'primary' && variant === 'borderless',
          'bg-zinc-800 text-zinc-50 hover:bg-zinc-900':
            color === 'secondary' && variant === 'solid',
          'bg-zinc-200 text-zinc-800 hover:bg-zinc-400':
            color === 'secondary' && variant === 'light',
          'bg-white text-zinc-800 border border-zinc-800 hover:bg-zinc-200':
            color === 'secondary' && variant === 'outlined',
          'bg-transparent text-zinc-800 underline hover:bg-zinc-200':
            color === 'secondary' && variant === 'borderless',
          'bg-transparent text-zinc-50 underline hover:bg-violet-900':
            color === 'tertiary' && variant === 'borderless',
          'py-1.5 px-3 text-sm': size === 'sm',
          'py-2 px-4': size === 'md',
          'py-2.5 px-5': size === 'lg',
          'w-full': fullWidth,
        })}
        {...anchorProps}
      >
        <div className="flex items-center justify-center gap-2">
          <Icon className={iconClassName} icon={startIcon} />
          {children}
          <Icon className={iconClassName} icon={endIcon} />
        </div>
      </Link>
    </div>
  );
};

export default LinkButton;
