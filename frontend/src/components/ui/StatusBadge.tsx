import { React } from 'react';
import { clsx } from 'clsx';
import type { IssueStatus } from '../../types/issues';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusColors: Record<IssueStatus, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    ACKNOWLEDGED: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        statusColors[status],
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        }
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
