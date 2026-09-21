import { Link } from 'react-router-dom';
import { Shield, Plus, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useIssues } from '../../hooks/useIssues';
import { formatDate } from '../../utils/formatting';
import type { Issue } from '../../types/issues';

export function CitizenDashboard() {
  const { user } = useAuth();
  const { issues, loading } = useIssues({ citizenId: user?.id });

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'OPEN').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your community reports
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.open}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <Link to="/app/report" className="flex-1">
          <Button size="lg" className="w-full">
            <Plus className="mr-2 h-5 w-5" />
            Report New Issue
          </Button>
        </Link>
        <Link to="/app/issues" className="flex-1">
          <Button variant="outline" size="lg" className="w-full">
            View All Issues
          </Button>
        </Link>
      </div>

      {/* Recent Issues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Issues</h2>
          <Link to="/app/issues" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues reported yet</h3>
            <p className="text-gray-600 mb-6">Start making your community better by reporting your first issue</p>
            <Link to="/app/report">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report First Issue
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.slice(0, 6).map((issue) => (
              <Link key={issue.id} to={`/app/issues/${issue.id}`}>
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
