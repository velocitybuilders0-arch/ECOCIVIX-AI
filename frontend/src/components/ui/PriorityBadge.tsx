import { React } from 'react';
import { clsx } from 'clsx';
import type { PriorityLevel } from '../../types/issues';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const priorityColors: Record<PriorityLevel, string> = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        priorityColors[priority],
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'px-4 py-1.5 text-base': size === 'lg',
        }
      )}
    >
      {priority}
    </span>
  );
}
