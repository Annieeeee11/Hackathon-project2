'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, X } from 'lucide-react';
import { Message } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { MAX_CONVERSATION_HISTORY, WELCOME_MESSAGE } from '@/lib/constants';
import { EmptyState } from '@/components/common';

interface ChatInterfaceProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-100 text-zinc-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs opacity-60 mt-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function ChatInterface({ jobId, isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && jobId) {
      setMessages([{
        ...WELCOME_MESSAGE,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, jobId, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !jobId || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          question: userMessage.content,
          conversationHistory: messages.slice(-MAX_CONVERSATION_HISTORY),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-zinc-200 flex flex-col z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-zinc-700" />
          <div>
            <h3 className="font-semibold text-zinc-900">Ask Questions</h3>
            {jobId && <p className="text-xs text-zinc-500">Job: {jobId.substring(0, 8)}...</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-200 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!jobId ? (
          <EmptyState
            icon={MessageSquare}
            title="Upload a document first"
            description="Upload a document to start asking questions"
            className="h-full"
          />
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={jobId ? "Ask about your documents..." : "Upload a document first"}
            disabled={!jobId || isLoading}
            className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!jobId || !input.trim() || isLoading}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
