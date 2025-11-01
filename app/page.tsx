'use client';

import { useState } from 'react';
import { Upload, FileText, Database, Download, Settings, Search, AlertCircle } from 'lucide-react';
import UploadZone from './components/UploadZone';
import JobStatus from './components/JobStatus';
import ResultsTable from './components/ResultsTable';
import SynonymsPanel from './components/SynonymsPanel';
import EvidenceDrawer from './components/EvidenceDrawer';

export default function Dashboard() {
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');

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
            <button className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
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
            <UploadZone onUpload={(files) => console.log(files)} />
          </div>

          {/* Job Status */}
          <div>
            <JobStatus status={jobStatus} />
          </div>
        </div>

        {/* Results Table */}
        <div className="mb-6">
          <ResultsTable onRowClick={(row) => setSelectedEvidence(row)} />
        </div>

        {/* Synonyms Panel */}
        <div>
          <SynonymsPanel />
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
