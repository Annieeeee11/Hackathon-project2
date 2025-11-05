'use client';

import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import React from 'react';
import { getStatusConfig } from '@/lib/utils';

interface JobStatusProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  documentsCount?: number;
  recordsCount?: number;
}

interface StatusIconProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
}

function StatusIcon({ status }: StatusIconProps) {
  const icons = {
    idle: Clock,
    processing: Loader2,
    completed: CheckCircle,
    error: XCircle,
  };

  const Icon = icons[status];
  return (
    <Icon className={`w-6 h-6 ${status === 'processing' ? 'animate-spin' : ''}`} />
  );
}

interface StatsCardProps {
  label: string;
  value: number;
}

function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="bg-zinc-50 rounded-lg p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

export default function JobStatus({ 
  status, 
  progress = 0, 
  message, 
  documentsCount = 0,
  recordsCount = 0 
}: JobStatusProps) {
  const config = getStatusConfig(status);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden h-93">
      <div className="px-6 py-4 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-900">Processing Status</h2>
      </div>

      <div className="p-6">
        {/* Status Display */}
        <div className={`${config.bg} rounded-lg p-6`}>
          <div className="flex items-start gap-4">
            <div className={config.color}>
              <StatusIcon status={status} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-base font-semibold ${config.color} mb-6`}>
                {config.label}
              </h3>
              <p className="text-sm text-zinc-600 mb-6">
                {message || config.description}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
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
          <StatsCard label="Documents" value={documentsCount} />
          <StatsCard label="Records" value={recordsCount} />
        </div>
      </div>
    </div>
  );
}
