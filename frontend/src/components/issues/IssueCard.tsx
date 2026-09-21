import { React } from 'react';
import { Card } from '../ui/Card';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/Badge';
import type { Issue } from '../../types/issues';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
  return (
    <Card onClick={onClick} className="p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{issue.title}</h3>
        <div className="flex space-x-2">
          <PriorityBadge priority={issue.mlPriority} size="sm" />
          <StatusBadge status={issue.status} size="sm" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{issue.locationContext || 'No location'}</span>
        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
    </Card>
  );
}
