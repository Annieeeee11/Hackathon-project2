'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Synonym {
  id: string;
  term: string;
  canonical: string;
}

const initialSynonyms: Synonym[] = [
  { id: '1', term: 'VAT', canonical: 'Goods & Services Tax' },
  { id: '2', term: 'Service Tax', canonical: 'Goods & Services Tax' },
  { id: '3', term: 'CGST', canonical: 'Central GST' },
  { id: '4', term: 'SGST', canonical: 'State GST' },
];

export default function SynonymsPanel() {
  const [synonyms, setSynonyms] = useState<Synonym[]>(initialSynonyms);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editCanonical, setEditCanonical] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newCanonical, setNewCanonical] = useState('');

  const startEdit = (synonym: Synonym) => {
    setEditingId(synonym.id);
    setEditTerm(synonym.term);
    setEditCanonical(synonym.canonical);
  };

  const saveEdit = () => {
    if (editingId) {
      setSynonyms(prev =>
        prev.map(s =>
          s.id === editingId
            ? { ...s, term: editTerm, canonical: editCanonical }
            : s
        )
      );
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTerm('');
    setEditCanonical('');
  };

  const deleteSynonym = (id: string) => {
    setSynonyms(prev => prev.filter(s => s.id !== id));
  };

  const addSynonym = () => {
    if (newTerm && newCanonical) {
      setSynonyms(prev => [
        ...prev,
        { id: Date.now().toString(), term: newTerm, canonical: newCanonical },
      ]);
      setNewTerm('');
      setNewCanonical('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
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

      <div className="p-6">
        <div className="space-y-2">
          {/* Add New Form */}
          {isAdding && (
            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Original Term
                  </label>
                  <input
                    type="text"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="e.g., VAT"
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Canonical Field
                  </label>
                  <input
                    type="text"
                    value={newCanonical}
                    onChange={(e) => setNewCanonical(e.target.value)}
                    placeholder="e.g., Goods & Services Tax"
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addSynonym}
                  className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewTerm('');
                    setNewCanonical('');
                  }}
                  className="px-3 py-1.5 bg-white text-zinc-700 text-xs font-medium border border-zinc-300 rounded hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Synonym List */}
          {synonyms.map((synonym) => (
            <div
              key={synonym.id}
              className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
            >
              {editingId === synonym.id ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={editTerm}
                      onChange={(e) => setEditTerm(e.target.value)}
                      className="px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={editCanonical}
                      onChange={(e) => setEditCanonical(e.target.value)}
                      className="px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveEdit}
                      className="p-1.5 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 bg-white text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
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
                    <button
                      onClick={() => startEdit(synonym)}
                      className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-zinc-600" />
                    </button>
                    <button
                      onClick={() => deleteSynonym(synonym.id)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

