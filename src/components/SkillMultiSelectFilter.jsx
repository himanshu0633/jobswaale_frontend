import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, X, Check, Loader, Database, Sparkles, Filter } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';

/**
 * SkillMultiSelectFilter
 * Employer filter component supporting multiple skill selection with AND-logic matching.
 * Fetches skills dynamically from the central database.
 */
const SkillMultiSelectFilter = ({
  selectedSkills = [],
  onChange,
  fallbackSkills = [],
  label = 'Search by Skill'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch skills from central database
  const fetchSkills = (query = '') => {
    setLoading(true);
    const qParam = encodeURIComponent(query.trim());
    axios.get(`${BASE_API_URL}/skills?q=${qParam}&limit=30`)
      .then((res) => {
        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data.map(item => (typeof item === 'string' ? item : item.name));
        } else if (Array.isArray(res.data?.skills)) {
          list = res.data.skills.map(item => (typeof item === 'string' ? item : item.name));
        } else if (Array.isArray(res.data?.names)) {
          list = res.data.names;
        }

        // Combine with fallback skills if available
        const combined = Array.from(new Set([...list, ...(fallbackSkills || [])])).filter(Boolean);
        setSuggestions(combined);
      })
      .catch(() => {
        if (fallbackSkills && fallbackSkills.length) {
          const filtered = fallbackSkills.filter(s =>
            !query.trim() || s.toLowerCase().includes(query.trim().toLowerCase())
          );
          setSuggestions(filtered);
        } else {
          setSuggestions([]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isOpen) {
      debounceRef.current = setTimeout(() => {
        fetchSkills(searchTerm);
      }, 150);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, isOpen]);

  const toggleSkill = (skill) => {
    const trimmed = String(skill || '').trim();
    if (!trimmed) return;

    const exists = selectedSkills.some(s => s.toLowerCase() === trimmed.toLowerCase());
    let next;
    if (exists) {
      next = selectedSkills.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    } else {
      next = [...selectedSkills, trimmed];
    }
    onChange(next);
    setSearchTerm('');
    if (inputRef.current) inputRef.current.focus();
  };

  const removeSkill = (skill) => {
    const next = selectedSkills.filter(s => s.toLowerCase() !== skill.toLowerCase());
    onChange(next);
  };

  const clearAllSkills = () => {
    onChange([]);
    setSearchTerm('');
  };

  const popularQuickPicks = ['Java', 'JavaScript', 'React.js', 'Node.js', 'Python', 'SQL', 'Laravel']
    .filter(s => !selectedSkills.some(sel => sel.toLowerCase() === s.toLowerCase()));

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
          <Filter className="h-3.5 w-3.5 text-[#6658dd]" />
          <span>{label}</span>
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-black text-[#6658dd] normal-case">
            AND Logic
          </span>
        </label>
        {selectedSkills.length > 0 && (
          <button
            type="button"
            onClick={clearAllSkills}
            className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition cursor-pointer"
          >
            Clear ({selectedSkills.length})
          </button>
        )}
      </div>

      {/* Main input & selected skills container */}
      <div
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) inputRef.current.focus();
        }}
        className="min-h-10 w-full rounded-md border border-slate-200 bg-white p-2 transition focus-within:border-[#6658dd] focus-within:ring-2 focus-within:ring-indigo-100 cursor-text"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedSkills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-md bg-[#6658dd] px-2.5 py-1 text-xs font-extrabold text-white shadow-xs"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(skill);
                }}
                className="cursor-pointer text-indigo-200 hover:text-white transition"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <div className="relative min-w-[140px] flex-1">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                setIsOpen(true);
                fetchSkills(searchTerm);
              }}
              placeholder={selectedSkills.length === 0 ? 'Search & select skills (e.g. Java, React)...' : 'Add another skill...'}
              className="w-full border-none bg-transparent py-1 text-xs font-semibold text-slate-700 outline-none placeholder:font-bold placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Helper Note */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {selectedSkills.length > 0 ? (
            <strong className="text-emerald-600 font-extrabold">
              ✓ Showing candidates with ALL {selectedSkills.length} selected skills
            </strong>
          ) : (
            'Select multiple skills — only candidates matching ALL will be returned'
          )}
        </span>
      </div>

      {/* Quick Suggestions Chips */}
      {selectedSkills.length < 3 && popularQuickPicks.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400">Popular:</span>
          {popularQuickPicks.slice(0, 5).map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:border-[#6658dd] hover:text-[#6658dd] transition cursor-pointer"
            >
              <span>+</span>
              <span>{skill}</span>
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-indigo-500" />
              <span>Skills in Database</span>
            </span>
            {loading && <Loader className="h-3 w-3 animate-spin text-indigo-600" />}
          </div>

          <div className="divide-y divide-slate-50 py-1">
            {suggestions.map((skill) => {
              const isSelected = selectedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
              return (
                <button
                  key={skill}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleSkill(skill);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-[#6658dd]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    <span>{skill}</span>
                  </span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black text-[#6658dd]">
                      <Check className="h-3 w-3" /> Selected
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">Add</span>
                  )}
                </button>
              );
            })}

            {!loading && suggestions.length === 0 && (
              <p className="px-3 py-3 text-center text-xs font-semibold text-slate-400">
                No matching skills found in database.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillMultiSelectFilter;
