'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface TagInputProps {
  value: string; // JSON array string e.g. '["abc","efg"]'
  onChange: (value: string) => void;
  disabled?: boolean;
  allTags?: string[];
}

export default function TagInput({ value, onChange, disabled, allTags = [] }: TagInputProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse JSON tags on value change
  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]');
      setTags(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
    } catch {
      setTags([]);
    }
  }, [value]);

  useEffect(() => {
    if (editingIndex !== null && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingIndex]);

  // Close suggestions on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    const lower = input.trim().toLowerCase();
    return allTags.filter(
      (t) => t.toLowerCase().startsWith(lower) && !tags.includes(t)
    ).slice(0, 8);
  }, [input, allTags, tags]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
    setSelectedSuggestion(0);
  }, [suggestions]);

  const commitTags = (newTags: string[]) => {
    setTags(newTags);
    onChange(JSON.stringify(newTags));
  };

  const addTag = (tagToAdd?: string) => {
    const trimmed = (tagToAdd || input).trim();
    if (trimmed && !tags.includes(trimmed)) {
      commitTags([...tags, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    commitTags(tags.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(tags[index]);
  };

  const finishEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      const newTags = [...tags];
      newTags[editingIndex] = trimmed;
      commitTags(newTags);
    } else {
      removeTag(editingIndex);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        addTag(suggestions[selectedSuggestion]);
      } else {
        addTag();
      }
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue('');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1 min-h-[24px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 text-sm leading-tight"
          >
            {editingIndex === i ? (
              <input
                ref={editRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={finishEdit}
                onKeyDown={handleEditKeyDown}
                className="bg-transparent border-0 p-0 text-sm w-12 min-w-0 focus:ring-0 text-primary-700"
                style={{ width: `${Math.max(editValue.length, 2)}ch` }}
              />
            ) : (
              <span
                onDoubleClick={() => !disabled && startEdit(i)}
                className="cursor-default select-none"
              >
                {tag}
              </span>
            )}
            {!disabled && editingIndex !== i && (
              <button
                onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                className="text-primary-400 hover:text-primary-700 leading-none"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M7 3L3 7M3 3l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input.trim() && !showSuggestions) addTag(); }}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="bg-transparent border-0 p-0 text-sm min-w-[40px] flex-1 focus:ring-0 text-gray-700 placeholder:text-gray-400"
            placeholder={tags.length === 0 ? '输入标签后回车' : ''}
            style={{ width: `${Math.max(input.length, 2)}ch` }}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute left-0 top-full z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-40 overflow-y-auto mt-1">
          {suggestions.map((s, i) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                i === selectedSuggestion
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
