import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatting';
import type { Issue } from '../../types/issues';

interface IssueDetailProps {
  issue: Issue;
  role: 'citizen' | 'staff' | 'admin';
}

export function IssueDetail({ issue, role }: IssueDetailProps) {
  return (
    <div className="space-y-6">
      <Link to={role === 'citizen' ? '/app/issues' : role === 'staff' ? '/staff/issues' : '/admin/issues'}>
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <PriorityBadge priority={issue.mlPriority} />
                  <StatusBadge status={issue.status} />
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700">{issue.description}</p>
            </div>

            {issue.imageUrl && (
              <div className="mt-4">
                <img
                  src={issue.imageUrl}
                  alt="Issue"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{issue.locationContext || 'No location'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(issue.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{issue.citizenName || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>{issue.assignedDepartment || 'Unassigned'}</span>
              </div>
            </div>
          </Card>

          {issue.aiAnalysis && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Category</div>
                  <div className="font-medium text-gray-900">
                    {issue.aiAnalysis.category?.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Department</div>
                  <div className="font-medium text-gray-900">{issue.aiAnalysis.department}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Environmental Impact</div>
                  <div className="font-medium text-gray-900">{issue.aiAnalysis.environmentalImpact}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Safety Risk</div>
                  <div className="font-medium text-gray-900">{issue.aiAnalysis.safetyRisk}</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Suggested Action</div>
                <div className="text-sm text-gray-900">{issue.aiAnalysis.suggestedAction}</div>
              </div>
            </Card>
          )}

          {issue.adminNote && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin Note</h2>
              <p className="text-gray-700">{issue.adminNote}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ML Priority Analysis</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Priority</div>
                <div className="text-2xl font-bold text-gray-900">{issue.mlPriority}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Confidence</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(issue.mlConfidence * 100)}%
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Model Version</div>
                <div className="text-sm text-gray-900">{issue.mlModelVersion}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Reported</div>
                  <div className="text-sm text-gray-600">{formatDateTime(issue.createdAt)}</div>
                </div>
              </div>
              {issue.status !== 'OPEN' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Acknowledged</div>
                    <div className="text-sm text-gray-600">{formatDateTime(issue.updatedAt)}</div>
                  </div>
                </div>
              )}
              {issue.status === 'IN_PROGRESS' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">In Progress</div>
                    <div className="text-sm text-gray-600">{formatDateTime(issue.updatedAt)}</div>
                  </div>
                </div>
              )}
              {issue.status === 'RESOLVED' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Resolved</div>
                    <div className="text-sm text-gray-600">{formatDateTime(issue.updatedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {role === 'admin' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-3">
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="OPEN">Open</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <textarea
                  placeholder="Add admin note..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button className="w-full">Update Status</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
