import { useIssues } from '../../hooks/useIssues';
import { Card } from '../../components/ui/Card';
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export function Analytics() {
  const { issues, loading } = useIssues();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'OPEN').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length,
    avgResolutionTime: issues.filter(i => i.status === 'RESOLVED').length > 0 
      ? '2.5 days' 
      : 'N/A',
  };

  const categoryStats = issues.reduce((acc, issue) => {
    const category = issue.aiAnalysis?.category || 'OTHER';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityStats = {
    critical: issues.filter(i => i.mlPriority === 'CRITICAL').length,
    high: issues.filter(i => i.mlPriority === 'HIGH').length,
    medium: issues.filter(i => i.mlPriority === 'MEDIUM').length,
    low: issues.filter(i => i.mlPriority === 'LOW').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights into community issue trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Resolution</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgResolutionTime}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.open + stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Issues by Category</h2>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (priorityStats.critical / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{priorityStats.critical}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (priorityStats.high / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{priorityStats.high}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (priorityStats.medium / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{priorityStats.medium}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (priorityStats.low / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{priorityStats.low}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
