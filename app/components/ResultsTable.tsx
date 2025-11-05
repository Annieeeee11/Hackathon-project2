'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { getResults } from '@/lib/api';
import { ResultRow } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SearchInput,
  EmptyState,
  LoadingSpinner,
  ConfidenceBadge,
  FileIcon,
} from '@/components/common';

interface ResultsTableProps {
  jobId: string | null;
  onRowClick: (row: ResultRow) => void;
}

export default function ResultsTable({ jobId, onRowClick }: ResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<ResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setData([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await getResults(jobId);
        setData(results);
      } catch (err) {
        setError('Failed to load results');
        console.error('[ResultsTable] Error fetching results:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [jobId]);

  const filteredData = data.filter(
    row =>
      row.originalTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.canonical.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.docName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Normalized Results</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {filteredData.length} records • Click any row to view evidence
            </p>
          </div>
          <SearchInput
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Page</TableHead>
            <TableHead>Original Term</TableHead>
            <TableHead>Canonical Field</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-center">Confidence</TableHead>
            <TableHead className="text-center">Evidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12">
                <LoadingSpinner text="Loading results..." />
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12">
                <div className="flex flex-col items-center justify-center text-red-500">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyState
                  icon={FileText}
                  title="No results found"
                  description="Upload documents to see normalized data"
                />
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick(row)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileIcon size="sm" />
                    <span className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">
                      {row.docName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-600">{row.page}</span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-700">
                    {row.originalTerm}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-zinc-900">
                    {row.canonical}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <span className="text-sm font-mono text-zinc-900">
                    {row.value}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <ConfidenceBadge confidence={row.confidence} />
                </TableCell>
                <TableCell align="center">
                  <button className="p-1.5 hover:bg-zinc-200 rounded transition-colors">
                    <ExternalLink className="w-4 h-4 text-zinc-600" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Footer */}
      {filteredData.length > 0 && (
        <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing {filteredData.length} of {data.length} results
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
