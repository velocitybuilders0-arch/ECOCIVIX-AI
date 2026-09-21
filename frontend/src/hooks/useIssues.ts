import { useState, useEffect } from 'react';
import type { Issue } from '../types/issues';
import { issuesService } from '../services/api/issues';
import { mockIssues } from '../services/mock/issues';

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
      // Use mock data for development
      let filtered = mockIssues;
      
      if (filters?.citizenId) {
        filtered = filtered.filter(i => i.citizenId === filters.citizenId);
      }
      if (filters?.status) {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      
      setIssues(filtered);
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
