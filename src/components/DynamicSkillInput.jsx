import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sparkles, X, Plus, Loader, Database, Check } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';

/**
 * DynamicSkillInput
 * Provides seamless skill input for Jobseeker profile:
 * - Real-time autocomplete suggestions from database
 * - Case-insensitive deduplication
 * - Allows selecting from existing skills OR entering brand new skills
 * - Automatically persists new skills to central database
 */
const DynamicSkillInput = ({
  skills = [],
  onAddSkill,
  onRemoveSkill,
  disabled = false,
  placeholder = 'Type skill (e.g. Java, React, Laravel)...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [localError, setLocalError] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from database
  const fetchSuggestions = (query = '') => {
    setLoading(true);
    const qParam = encodeURIComponent(query.trim());
    axios.get(`${BASE_API_URL}/skills?q=${qParam}&limit=25`)
      .then((res) => {
        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data.map(item => (typeof item === 'string' ? item : item.name));
        } else if (Array.isArray(res.data?.skills)) {
          list = res.data.skills.map(item => (typeof item === 'string' ? item : item.name));
        } else if (Array.isArray(res.data?.names)) {
          list = res.data.names;
        }

        // Filter out skills already selected by the user (case-insensitive)
        const currentLower = (skills || []).map(s => String(s).trim().toLowerCase());
        const filtered = list.filter(s => s && !currentLower.includes(String(s).trim().toLowerCase()));

        setSuggestions(filtered);
      })
      .catch((err) => {
        console.warn('Failed to fetch skill suggestions:', err?.message);
        setSuggestions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Debounced search when input changes
  useEffect(() => {
    if (disabled) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (isOpen) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(inputValue);
      }, 150);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [inputValue, isOpen, disabled, skills]);

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    fetchSuggestions(inputValue);
  };

  // Add skill handler
  const handleSelectOrAdd = (rawSkill) => {
    const val = String(rawSkill || inputValue || '').replace(/,/g, '').trim();
    if (!val) return;

    if (/^\d+$/.test(val)) {
      setLocalError('Skill name cannot consist solely of digits.');
      return;
    }

    if (!/^[a-zA-Z0-9+#.\s/-]{2,40}$/.test(val)) {
      setLocalError('Please enter a valid skill name (e.g. Java, React, Node.js).');
      return;
    }

    // Check if skill already exists in selected skills (case-insensitive)
    const exists = (skills || []).some(s => String(s).trim().toLowerCase() === val.toLowerCase());
    if (exists) {
      setLocalError(`"${val}" has already been added.`);
      setInputValue('');
      setIsOpen(false);
      return;
    }

    setLocalError('');

    // Normalize casing for display
    let finalName = val;
    const matchInSuggestions = suggestions.find(s => s.toLowerCase() === val.toLowerCase());
    if (matchInSuggestions) {
      finalName = matchInSuggestions;
    } else {
      if (val === val.toUpperCase() && val.length > 2) {
        finalName = val.charAt(0) + val.slice(1).toLowerCase();
      } else if (val === val.toLowerCase()) {
        finalName = val.charAt(0).toUpperCase() + val.slice(1);
      }
    }

    // Add to local state in parent
    onAddSkill(finalName);

    // Save to central database so it immediately becomes available for everyone
    axios.post(`${BASE_API_URL}/skills`, { name: finalName }).catch(() => {});

    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectOrAdd(suggestions[highlightedIndex]);
      } else {
        handleSelectOrAdd(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const hasExactMatch = suggestions.some(
    s => s.toLowerCase() === inputValue.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected skill chips & input area */}
      <div
        onClick={() => {
          if (!disabled && inputRef.current) inputRef.current.focus();
        }}
        className={`flex flex-wrap items-center gap-2 rounded-md border p-3 transition-colors ${
          disabled
            ? 'cursor-default border-slate-200 bg-slate-50/70'
            : 'cursor-text border-slate-200 bg-white focus-within:border-[#0047C7] focus-within:ring-2 focus-within:ring-blue-100'
        }`}
      >
        {(skills || []).map(skill => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047C7] shadow-xs"
          >
            <span>{skill}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSkill(skill);
                }}
                className="cursor-pointer text-blue-500 hover:text-rose-600 transition"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <div className="relative min-w-[160px] flex-1">
            <input
              ref={inputRef}
              type="text"
              id="skillInput"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setLocalError('');
                setIsOpen(true);
              }}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={skills.length === 0 ? placeholder : 'Add more skills...'}
              className="w-full border-none bg-transparent px-1 py-1 text-xs text-slate-700 outline-none focus:outline-none placeholder:text-slate-400 font-medium"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      {localError && (
        <p className="mt-1.5 text-xs font-bold text-rose-500 animate-fadeIn">
          {localError}
        </p>
      )}

      {/* Dynamic Dropdown from Database */}
      {!disabled && isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3 text-indigo-500" />
              {inputValue.trim() ? `Skills matching "${inputValue.trim()}"` : 'Popular Skills from Database'}
            </span>
            {loading && <Loader className="h-3 w-3 animate-spin text-indigo-600" />}
          </div>

          <div className="divide-y divide-slate-50 py-1">
            {suggestions.map((suggestion, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOrAdd(suggestion);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-bold transition cursor-pointer ${
                    isHighlighted
                      ? 'bg-blue-50 text-[#0047C7]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    <span>{suggestion}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Select</span>
                </button>
              );
            })}

            {/* Custom / New skill entry option */}
            {inputValue.trim().length >= 2 && !hasExactMatch && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectOrAdd(inputValue);
                }}
                className="flex w-full items-center justify-between rounded-md bg-emerald-50/70 px-3 py-2 text-left text-xs font-extrabold text-emerald-700 hover:bg-emerald-100/70 transition cursor-pointer mt-1"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Plus className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Add new skill: <strong>&quot;{inputValue.trim()}&quot;</strong></span>
                </span>
                <span className="rounded bg-emerald-200/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                  Save to DB
                </span>
              </button>
            )}

            {!loading && suggestions.length === 0 && !inputValue.trim() && (
              <p className="px-3 py-2 text-center text-xs font-semibold text-slate-400">
                Type to search or enter a new skill.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicSkillInput;
