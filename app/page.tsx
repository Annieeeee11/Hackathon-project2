'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Settings } from 'lucide-react';
import { toast } from 'sonner';
import UploadZone from './components/UploadZone';
import JobStatus from './components/JobStatus';
import ResultsTable from './components/ResultsTable';
import SynonymsPanel from './components/SynonymsPanel';
import EvidenceDrawer from './components/EvidenceDrawer';
import { getJobStatus, exportCSV } from '@/lib/api';

export default function Dashboard() {
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [recordsCount, setRecordsCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  // Load jobId from localStorage on mount
  useEffect(() => {
    const savedJobId = localStorage.getItem('currentJobId');
    if (savedJobId) {
      setCurrentJobId(savedJobId);
      // Fetch the job status
      const loadJobStatus = async () => {
        try {
          const status = await getJobStatus(savedJobId);
          setJobStatus(status.status === 'done' ? 'completed' : status.status === 'running' ? 'processing' : status.status);
          setProgress(status.progress || 0);
          setDocumentsCount(status.documentsProcessed || 0);
          setRecordsCount(status.totalRecords || 0);
          setStatusMessage(status.message);
        } catch (error) {
          console.error('Failed to load saved job:', error);
          localStorage.removeItem('currentJobId');
        }
      };
      loadJobStatus();
    }
  }, []);

  // Poll job status when we have an active job
  useEffect(() => {
    if (!currentJobId || jobStatus === 'completed' || jobStatus === 'error') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await getJobStatus(currentJobId);
        
        setJobStatus(status.status === 'done' ? 'completed' : status.status === 'running' ? 'processing' : status.status);
        setProgress(status.progress || 0);
        setDocumentsCount(status.documentsProcessed || 0);
        setRecordsCount(status.totalRecords || 0);
        setStatusMessage(status.message);

        if (status.status === 'done') {
          clearInterval(pollInterval);
          toast.success('Processing completed successfully!');
          // Keep jobId in localStorage for completed jobs
        } else if (status.status === 'error') {
          clearInterval(pollInterval);
          toast.error(status.message || 'Processing failed');
          // Keep jobId even on error so user can see what happened
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentJobId, jobStatus]);

  const handleJobCreated = useCallback((jobId: string) => {
    setCurrentJobId(jobId);
    setJobStatus('processing');
    setProgress(0);
    // Save to localStorage
    localStorage.setItem('currentJobId', jobId);
  }, []);

  const handleRefreshResults = useCallback(() => {
    if (currentJobId && jobStatus === 'completed') {
      toast.info('Refreshing results...');
      // Results table will refetch automatically when this changes
      setRecordsCount(prev => prev); // Trigger re-render
    }
  }, [currentJobId, jobStatus]);

  const handleExportCSV = async () => {
    if (!currentJobId) {
      toast.error('No results to export');
      return;
    }

    setIsExporting(true);
    try {
      await exportCSV(currentJobId);
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">Finance Concept Translator</h1>
              <p className="text-xs text-zinc-500">Normalize financial documents in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!currentJobId && (
              <button
                onClick={() => {
                  // Load test data
                  const testJobId = '00000000-0000-0000-0000-000000000001';
                  setCurrentJobId(testJobId);
                  setJobStatus('completed');
                  setProgress(100);
                  setDocumentsCount(2);
                  setRecordsCount(6);
                  setStatusMessage('Test data - Processing completed successfully');
                  localStorage.setItem('currentJobId', testJobId);
                  toast.success('Loaded test data!');
                }}
                className="px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Load Test Data
              </button>
            )}
            {currentJobId && (
              <button
                onClick={() => {
                  setCurrentJobId(null);
                  setJobStatus('idle');
                  setProgress(0);
                  setDocumentsCount(0);
                  setRecordsCount(0);
                  localStorage.removeItem('currentJobId');
                  toast.info('Cleared current job');
                }}
                className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                New Upload
              </button>
            )}
            <button 
              onClick={handleExportCSV}
              disabled={!currentJobId || jobStatus !== 'completed' || isExporting}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Upload Zone */}
          <div className="lg:col-span-2">
            <UploadZone onJobCreated={handleJobCreated} />
          </div>

          {/* Job Status */}
          <div>
            <JobStatus 
              status={jobStatus} 
              progress={progress}
              message={statusMessage}
              documentsCount={documentsCount}
              recordsCount={recordsCount}
            />
          </div>
        </div>

        {/* Results Table */}
        <div className="mb-6">
          <ResultsTable 
            jobId={currentJobId}
            onRowClick={(row) => setSelectedEvidence(row)} 
          />
        </div>

        {/* Synonyms Panel */}
        <div>
          <SynonymsPanel onSynonymChange={handleRefreshResults} />
        </div>
      </main>

      {/* Evidence Drawer */}
      {selectedEvidence && (
        <EvidenceDrawer 
          evidence={selectedEvidence} 
          onClose={() => setSelectedEvidence(null)} 
        />
      )}
    </div>
  );
}
