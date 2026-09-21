import { useState, useEffect } from 'react';
import type { Issue } from '../types/issues';
import { issuesService } from '../services/api/issues';

export function useIssues(filters?: {
  status?: string;
  citizenId?: string;
  limit?: number;
  offset?: number;
}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await issuesService.getIssues(filters);
      setIssues(response.issues);
    } catch (err) {
      setError('Failed to fetch issues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  return { issues, loading, error, refetch: fetchIssues };
}
