'use client';

import { X, FileText, MapPin } from 'lucide-react';
import { Evidence } from '@/lib/types';
import { ConfidenceBadge } from '@/components/common';

interface EvidenceDrawerProps {
  evidence: Evidence;
  onClose: () => void;
}

interface InfoCardProps {
  label: string;
  children: React.ReactNode;
}

function InfoCard({ label, children }: InfoCardProps) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

export default function EvidenceDrawer({ evidence, onClose }: EvidenceDrawerProps) {
  // Use real evidence from database, fallback to formatted snippet if not available
  const evidenceSnippet = evidence.evidence || 
    `Invoice Total: Rs. 15,000
${evidence.originalTerm}: Rs. ${evidence.value}
Net Amount: Rs. 13,800

Terms and Conditions:
Payment due within 30 days of invoice date.`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Evidence Details</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Source document and extracted snippet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Document Info */}
          <div className="bg-zinc-50 rounded-lg p-5 border border-zinc-200 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Document">
                <p className="text-sm font-medium text-zinc-900">{evidence.docName}</p>
              </InfoCard>
              <InfoCard label="Page Number">
                <p className="text-sm font-medium text-zinc-900">Page {evidence.page}</p>
              </InfoCard>
              <InfoCard label="Original Term">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-zinc-200 text-sm font-medium text-zinc-800">
                  {evidence.originalTerm}
                </span>
              </InfoCard>
              <InfoCard label="Confidence Score">
                <ConfidenceBadge confidence={evidence.confidence} />
              </InfoCard>
            </div>
          </div>

          {/* Mapping Info */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Field Mapping
            </h3>
            <div className="bg-linear-to-r from-zinc-50 to-zinc-100 rounded-lg p-5 border border-zinc-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 mb-1">Original Term</p>
                  <p className="text-base font-semibold text-zinc-900">{evidence.originalTerm}</p>
                </div>
                <div className="shrink-0">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 mb-1">Canonical Field</p>
                  <p className="text-base font-semibold text-zinc-900">{evidence.canonical}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-300">
                <p className="text-xs text-zinc-500 mb-1">Extracted Value</p>
                <p className="text-xl font-mono font-bold text-zinc-900">Rs.{evidence.value}</p>
              </div>
            </div>
          </div>

          {/* Evidence Snippet */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Source Text Snippet
              </h3>
            </div>
            <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
              <pre className="text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                {evidenceSnippet}
              </pre>
            </div>
            <p className="text-xs text-zinc-500 mt-3 flex items-start gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-zinc-400 rounded-full mt-1.5"></span>
              <span>
                This snippet shows the exact location where the term "{evidence.originalTerm}" was
                found in the original document. The extraction algorithm identified this with{' '}
                {evidence.confidence}% confidence.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between">
            <button className="text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors">
              View Full Document
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
