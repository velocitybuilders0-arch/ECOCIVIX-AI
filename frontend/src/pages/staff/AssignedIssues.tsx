import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useIssues } from '../../hooks/useIssues';
import { formatDate } from '../../utils/formatting';
import type { IssueStatus, PriorityLevel } from '../../types/issues';

export function AssignedIssues() {
  const { user } = useAuth();
  const { issues, loading } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'ALL'>('ALL');

  const assignedIssues = issues.filter(i => i.assignedStaffId === user?.id);

  const filteredIssues = assignedIssues
    .filter((issue) => {
      const matchesSearch = 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || issue.mlPriority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Issues</h1>
          <p className="text-gray-600 mt-1">View and manage issues assigned to you</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityLevel | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <Card className="p-12 text-center">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned issues found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : 'You currently have no issues assigned to you'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIssues.map((issue) => (
            <Link key={issue.id} to={`/staff/issues/${issue.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{issue.title}</h3>
                  <PriorityBadge priority={issue.mlPriority} size="sm" className="ml-2 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{issue.locationContext || 'No location'}</span>
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <StatusBadge status={issue.status} size="sm" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
