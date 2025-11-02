'use client';

import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { exportCSV } from '@/lib/api';
import { Button, Card } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';

export function ExportBar() {
  const { jobId, fetchResults, status } = useAppStore();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleExport = async () => {
    if (!jobId) {
      showToast('No job ID available', 'error');
      return;
    }

    setExporting(true);
    try {
      await exportCSV(jobId);
      showToast('CSV exported successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = async () => {
    if (!jobId) {
      showToast('No job ID available', 'error');
      return;
    }

    setRefreshing(true);
    try {
      await fetchResults(jobId);
      showToast('Results refreshed', 'success');
    } catch (error: any) {
      showToast(error.message || 'Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleExport}
          variant="primary"
          size="md"
          className="flex-1"
          disabled={exporting || !jobId || status !== 'done'}
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : 'Download CSV'}
        </Button>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="md"
          className="flex-1"
          disabled={refreshing || !jobId || status !== 'done'}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Results'}
        </Button>
      </div>
    </Card>
  );
}
