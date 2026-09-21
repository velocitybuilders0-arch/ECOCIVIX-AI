import { React } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        {
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
}
