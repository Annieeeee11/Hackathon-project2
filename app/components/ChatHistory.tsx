'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Calendar } from 'lucide-react';
import { getChatHistory } from '@/lib/api';
import { ChatHistoryItem } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { EmptyState, LoadingSpinner } from '@/components/common';

interface ChatHistoryProps {
  jobId?: string | null;
  onHistorySelect?: (item: ChatHistoryItem) => void;
}

export default function ChatHistory({ jobId, onHistorySelect }: ChatHistoryProps) {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [jobId]);

  async function fetchHistory() {
    if (!jobId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const chatHistory = await getChatHistory(jobId);
      setHistory(chatHistory);
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const displayedHistory = showAll ? history : history.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Chat History</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {jobId ? 'Conversation history for this job' : 'Select a job to view chat history'}
          </p>
        </div>
        {history.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-zinc-600 hover:text-zinc-900 font-medium"
          >
            {showAll ? 'Show Less' : `Show All (${history.length})`}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`overflow-y-auto ${showAll ? 'max-h-[400px]' : ''}`}>
        {!jobId ? (
          <EmptyState
            icon={MessageSquare}
            title="No job selected"
            description="Process a document to start chatting"
          />
        ) : isLoading ? (
          <div className="px-6 py-12">
            <LoadingSpinner text="Loading history..." />
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No chat history yet"
            description="Start asking questions to see history"
          />
        ) : (
          <div className="divide-y divide-zinc-200">
            {displayedHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onHistorySelect?.(item)}
                className={`px-6 py-4 hover:bg-zinc-50 transition-colors ${
                  onHistorySelect ? 'cursor-pointer' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Question */}
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-zinc-600 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-zinc-900">{item.question}</p>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(item.created_at)}
                      </span>
                    </div>
                  </div>
                  {/* Answer */}
                  <div className="flex items-start gap-2 pl-6">
                    <Bot className="w-4 h-4 text-zinc-600 mt-1 shrink-0" />
                    <p className="text-sm text-zinc-600 flex-1">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
