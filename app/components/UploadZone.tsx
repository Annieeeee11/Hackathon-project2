'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFiles } from '@/lib/api';

interface UploadZoneProps {
  onJobCreated: (jobId: string) => void;
}

export default function UploadZone({ onJobCreated }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one PDF file');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await uploadFiles(uploadedFiles);
      onJobCreated(response.jobId);
      toast.success(`Processing started! Job ID: ${response.jobId}`);
      setUploadedFiles([]); // Clear uploaded files
    } catch (error) {
      toast.error('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-900">Upload Documents</h2>
        <p className="text-xs text-zinc-500 mt-1">Upload PDF files to extract and normalize financial data</p>
      </div>

      <div className="p-6">
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all ${
            dragActive
              ? 'border-zinc-400 bg-zinc-50'
              : 'border-zinc-300 hover:border-zinc-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-900 mb-1">
              Drop PDF files here or click to browse
            </p>
            <p className="text-xs text-zinc-500">
              Support for multiple files • Maximum 10MB per file
            </p>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-zinc-200 rounded flex items-center justify-center shrink-0">
                    <File className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-zinc-200 rounded transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-zinc-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className="mt-4 w-full px-4 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Process {uploadedFiles.length} {uploadedFiles.length === 1 ? 'Document' : 'Documents'}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

