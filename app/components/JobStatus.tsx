'use client';

import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface JobStatusProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

export default function JobStatus({ status, progress = 0, message }: JobStatusProps) {
  const statusConfig = {
    idle: {
      icon: Clock,
      text: 'Ready',
      color: 'text-zinc-500',
      bg: 'bg-zinc-100',
      description: 'Upload documents to begin processing',
    },
    processing: {
      icon: Loader2,
      text: 'Processing',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: message || 'Extracting and normalizing data...',
      animate: true,
    },
    completed: {
      icon: CheckCircle,
      text: 'Completed',
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Documents processed successfully',
    },
    error: {
      icon: XCircle,
      text: 'Error',
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: message || 'An error occurred during processing',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-900">Processing Status</h2>
      </div>

      <div className="p-6">
        <div className={`${config.bg} rounded-lg p-6`}>
          <div className="flex items-start gap-4">
            <div className={`${config.color} shrink-0`}>
              <Icon className={`w-6 h-6 ${config.animate ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-base font-semibold ${config.color} mb-1`}>
                {config.text}
              </h3>
              <p className="text-sm text-zinc-600">
                {config.description}
              </p>
            </div>
          </div>

          {status === 'processing' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-600 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Documents</p>
            <p className="text-2xl font-semibold text-zinc-900">0</p>
          </div>
          <div className="bg-zinc-50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Records</p>
            <p className="text-2xl font-semibold text-zinc-900">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

