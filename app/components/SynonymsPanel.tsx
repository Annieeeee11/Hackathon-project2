'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSynonyms, createSynonym, updateSynonym, deleteSynonym } from '@/lib/api';
import { Synonym } from '@/lib/types';
import { LoadingSpinner, FormInput, IconButton } from '@/components/common';

interface SynonymsPanelProps {
  onSynonymChange?: () => void;
}

interface SynonymFormProps {
  term: string;
  canonical: string;
  onTermChange: (value: string) => void;
  onCanonicalChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

// Reusable form component for adding/editing synonyms
function SynonymForm({
  term,
  canonical,
  onTermChange,
  onCanonicalChange,
  onSave,
  onCancel,
  isSaving,
}: SynonymFormProps) {
  return (
    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <FormInput
          label="Original Term"
          placeholder="e.g., VAT"
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
        />
        <FormInput
          label="Canonical Field"
          placeholder="e.g., Goods & Services Tax"
          value={canonical}
          onChange={(e) => onCanonicalChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded hover:bg-zinc-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <LoadingSpinner size="sm" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-white text-zinc-700 text-xs font-medium border border-zinc-300 rounded hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// Reusable display component for synonym items
interface SynonymItemProps {
  synonym: Synonym;
  onEdit: (synonym: Synonym) => void;
  onDelete: (id: string) => void;
}

function SynonymItem({ synonym, onEdit, onDelete }: SynonymItemProps) {
  return (
    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm font-medium text-zinc-900 min-w-[120px]">
            {synonym.term}
          </span>
          <span className="text-zinc-400">→</span>
          <span className="text-sm text-zinc-600">
            {synonym.canonical}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={Edit2}
            size="sm"
            onClick={() => onEdit(synonym)}
            aria-label="Edit synonym"
          />
          <IconButton
            icon={Trash2}
            variant="danger"
            size="sm"
            onClick={() => onDelete(synonym.id)}
            aria-label="Delete synonym"
          />
        </div>
      </div>
    </div>
  );
}

export default function SynonymsPanel({ onSynonymChange }: SynonymsPanelProps) {
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editCanonical, setEditCanonical] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newCanonical, setNewCanonical] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSynonyms();
  }, []);

  async function loadSynonyms() {
    setIsLoading(true);
    try {
      const data = await getSynonyms();
      setSynonyms(data);
    } catch (error) {
      toast.error('Failed to load synonyms');
      console.error('Error loading synonyms:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(synonym: Synonym) {
    setEditingId(synonym.id);
    setEditTerm(synonym.term);
    setEditCanonical(synonym.canonical);
  }

  async function saveEdit() {
    if (!editingId || !editTerm || !editCanonical) return;

    setIsSaving(true);
    try {
      await updateSynonym(editingId, editTerm, editCanonical);
      setSynonyms(prev =>
        prev.map(s =>
          s.id === editingId
            ? { ...s, term: editTerm, canonical: editCanonical }
            : s
        )
      );
      setEditingId(null);
      toast.success('Synonym updated successfully');
      onSynonymChange?.();
    } catch (error) {
      toast.error('Failed to update synonym');
      console.error('Error updating synonym:', error);
    } finally {
      setIsSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTerm('');
    setEditCanonical('');
  }

  async function handleDelete(id: string) {
    try {
      await deleteSynonym(id);
      setSynonyms(prev => prev.filter(s => s.id !== id));
      toast.success('Synonym deleted successfully');
      onSynonymChange?.();
    } catch (error) {
      toast.error('Failed to delete synonym');
      console.error('Error deleting synonym:', error);
    }
  }

  async function addSynonym() {
    if (!newTerm || !newCanonical) {
      toast.error('Please fill in both fields');
      return;
    }

    const existing = synonyms.find(s => s.term.toLowerCase().trim() === newTerm.toLowerCase().trim());
    
    setIsSaving(true);
    try {
      if (existing) {
        await updateSynonym(existing.id, newTerm.trim(), newCanonical.trim());
        setSynonyms(prev =>
          prev.map(s =>
            s.id === existing.id
              ? { ...s, term: newTerm.trim(), canonical: newCanonical.trim() }
              : s
          )
        );
        toast.success('Synonym updated successfully');
      } else {
        const newSynonym = await createSynonym(newTerm.trim(), newCanonical.trim());
        setSynonyms(prev => [...prev, newSynonym]);
        toast.success('Synonym added successfully');
      }
      setNewTerm('');
      setNewCanonical('');
      setIsAdding(false);
      onSynonymChange?.();
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        const existingByTerm = synonyms.find(s => s.term.toLowerCase().trim() === newTerm.toLowerCase().trim());
        if (existingByTerm) {
          try {
            await updateSynonym(existingByTerm.id, newTerm.trim(), newCanonical.trim());
            setSynonyms(prev =>
              prev.map(s =>
                s.id === existingByTerm.id
                  ? { ...s, term: newTerm.trim(), canonical: newCanonical.trim() }
                  : s
              )
            );
            toast.success('Synonym updated successfully');
            setNewTerm('');
            setNewCanonical('');
            setIsAdding(false);
            onSynonymChange?.();
            return;
          } catch (updateError) {
            toast.error('Failed to update existing synonym');
            console.error('Error updating synonym:', updateError);
          }
        } else {
          toast.error('A synonym with this term already exists. Please edit the existing one.');
        }
      } else {
        toast.error(error.message || 'Failed to add synonym');
        console.error('Error adding synonym:', error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Synonym Mappings</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {synonyms.length} mappings • Changes apply instantly
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Mapping
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Add New Form */}
            {isAdding && (
              <SynonymForm
                term={newTerm}
                canonical={newCanonical}
                onTermChange={setNewTerm}
                onCanonicalChange={setNewCanonical}
                onSave={addSynonym}
                onCancel={() => {
                  setIsAdding(false);
                  setNewTerm('');
                  setNewCanonical('');
                }}
                isSaving={isSaving}
              />
            )}

            {/* Synonym List */}
            {synonyms.map((synonym) => (
              <div key={synonym.id}>
                {editingId === synonym.id ? (
                  <SynonymForm
                    term={editTerm}
                    canonical={editCanonical}
                    onTermChange={setEditTerm}
                    onCanonicalChange={setEditCanonical}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    isSaving={isSaving}
                  />
                ) : (
                  <SynonymItem
                    synonym={synonym}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
