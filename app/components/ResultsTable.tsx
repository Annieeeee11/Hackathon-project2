'use client';

import { useState } from 'react';
import { Search, ChevronDown, FileText, ExternalLink } from 'lucide-react';

interface ResultRow {
  id: string;
  docName: string;
  page: number;
  originalTerm: string;
  canonical: string;
  value: string;
  confidence: number;
}

interface ResultsTableProps {
  onRowClick: (row: ResultRow) => void;
}

// Sample data
const sampleData: ResultRow[] = [
  {
    id: '1',
    docName: 'invoice_001.pdf',
    page: 2,
    originalTerm: 'GST',
    canonical: 'Goods & Services Tax',
    value: '1,200.00',
    confidence: 98,
  },
  {
    id: '2',
    docName: 'invoice_002.pdf',
    page: 1,
    originalTerm: 'VAT',
    canonical: 'Goods & Services Tax',
    value: '850.50',
    confidence: 95,
  },
  {
    id: '3',
    docName: 'invoice_003.pdf',
    page: 3,
    originalTerm: 'Service Tax',
    canonical: 'Goods & Services Tax',
    value: '450.00',
    confidence: 92,
  },
];

export default function ResultsTable({ onRowClick }: ResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [data] = useState<ResultRow[]>(sampleData);

  const filteredData = data.filter(
    row =>
      row.originalTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.canonical.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.docName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Normalized Results</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {filteredData.length} records • Click any row to view evidence
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Original Term
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Canonical Field
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Evidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-500">
                    <FileText className="w-12 h-12 mb-3 text-zinc-300" />
                    <p className="text-sm font-medium">No results found</p>
                    <p className="text-xs mt-1">Upload documents to see normalized data</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-zinc-600" />
                      </div>
                      <span className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">
                        {row.docName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600">{row.page}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-700">
                      {row.originalTerm}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-zinc-900">
                      {row.canonical}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-mono text-zinc-900">
                      ${row.value}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.confidence >= 95
                          ? 'bg-green-50 text-green-700'
                          : row.confidence >= 90
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {row.confidence}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 hover:bg-zinc-200 rounded transition-colors">
                      <ExternalLink className="w-4 h-4 text-zinc-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

