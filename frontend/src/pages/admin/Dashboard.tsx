import { Link } from 'react-router-dom';
import { Shield, Users, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useIssues } from '../../hooks/useIssues';
import { formatDate } from '../../utils/formatting';
import type { Issue } from '../../types/issues';

export function AdminDashboard() {
  const { issues, loading } = useIssues();

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'OPEN').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length,
    critical: issues.filter(i => i.mlPriority === 'CRITICAL').length,
    high: issues.filter(i => i.mlPriority === 'HIGH').length,
  };

  const categoryDistribution = issues.reduce((acc, issue) => {
    const category = issue.aiAnalysis?.category || 'OTHER';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of all community issues and system metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issues</p>
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
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.critical}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
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
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Issues by Priority</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.critical / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.critical}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.high}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? ((issues.filter(i => i.mlPriority === 'MEDIUM').length) / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{issues.filter(i => i.mlPriority === 'MEDIUM').length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? ((issues.filter(i => i.mlPriority === 'LOW').length) / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{issues.filter(i => i.mlPriority === 'LOW').length}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Issues by Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Open</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.open / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.open}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.inProgress}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resolved</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.resolved}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/admin/issues" className="flex-1">
          <Button size="lg" className="w-full">
            Manage All Issues
          </Button>
        </Link>
        <Link to="/admin/analytics" className="flex-1">
          <Button variant="outline" size="lg" className="w-full">
            View Analytics
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Issues</h2>
          <Link to="/admin/issues" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
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
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues reported yet</h3>
            <p className="text-gray-600">The system is ready to receive community reports</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.slice(0, 6).map((issue) => (
              <Link key={issue.id} to={`/admin/issues/${issue.id}`}>
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
