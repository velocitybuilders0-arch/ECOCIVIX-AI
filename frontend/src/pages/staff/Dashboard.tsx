import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useIssues } from '../../hooks/useIssues';
import { formatDate } from '../../utils/formatting';
import type { Issue } from '../../types/issues';

export function StaffDashboard() {
  const { user } = useAuth();
  const { issues, loading } = useIssues();

  const assignedIssues = issues.filter(i => i.assignedStaffId === user?.id);
  const stats = {
    assigned: assignedIssues.length,
    inProgress: assignedIssues.filter(i => i.status === 'IN_PROGRESS').length,
    completed: assignedIssues.filter(i => i.status === 'RESOLVED').length,
    highPriority: assignedIssues.filter(i => i.mlPriority === 'HIGH' || i.mlPriority === 'CRITICAL').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your assigned issues and update work status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.assigned}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.highPriority}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/staff/issues" className="flex-1">
          <Button size="lg" className="w-full">
            View All Assigned Issues
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Assignments</h2>
          <Link to="/staff/issues" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issues...</p>
          </div>
        ) : assignedIssues.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned issues</h3>
            <p className="text-gray-600">You currently have no issues assigned to you</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedIssues.slice(0, 6).map((issue) => (
              <Link key={issue.id} to={`/staff/issues/${issue.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{issue.title}</h3>
                    <PriorityBadge priority={issue.mlPriority} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={issue.status} size="sm" />
                    <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
