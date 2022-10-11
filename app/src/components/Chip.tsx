import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import type { PropsWithChildren } from 'react';
import type { Icon } from './Icons/types';

type IconProp = IconDefinition | Icon;

type ChipProps = PropsWithChildren<{
  color?: 'primary' | 'secondary';
  variant?: 'solid' | 'light' | 'outlined';
  size?: 'sm' | 'md';
  startIcon?: IconProp;
  endIcon?: IconProp;
}>;

const Chip = ({
  color = 'primary',
  variant = 'light',
  size = 'md',
  startIcon,
  endIcon,
  children,
}: ChipProps) => (
  <div
    className={cn(
      'flex flex-row px-3 text-base items-center justify-center gap-2 rounded-3xl',
      {
        'py-2': size === 'md',
        'bg-violet-700 text-white': color === 'primary' && variant === 'solid',
        'bg-violet-100 text-violet-800':
          color === 'primary' && variant === 'light',
        'bg-white text-violet-800 border border-violet-800  ':
          color === 'primary' && variant === 'outlined',
        'bg-zinc-800 text-white': color === 'secondary' && variant === 'solid',
        'bg-zinc-200 text-zinc-800':
          color === 'secondary' && variant === 'light',
        'bg-white text-zinc-800 border border-zinc-800':
          color === 'secondary' && variant === 'outlined',
        'py-0': size === 'sm',
        'py-1': size === 'md',
      }
    )}
  >
    {renderIcon(startIcon)}
    {children}
    {renderIcon(endIcon)}
  </div>
);

const renderIcon = (Icon: IconProp | undefined) => {
  const finalClassName = cn('w-4 h-4');
  if (!Icon) {
    return null;
  }
  if (typeof Icon === 'function') {
    return <Icon className={finalClassName} />;
  }
  return <FontAwesomeIcon icon={Icon} className={finalClassName} />;
};

export default Chip;