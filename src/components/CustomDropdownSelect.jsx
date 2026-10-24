import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * CustomDropdownSelect
 * High-performance, accessible dropdown with internal scrolling (~10 items max height)
 * and search filter.
 */
export const CustomDropdownSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = true,
  className = '',
  buttonClassName = '',
  error = false,
  getOptionValue = (opt) => opt?.value ?? opt?._id ?? opt?.id ?? opt,
  getOptionLabel = (opt) => opt?.label ?? opt?.name ?? opt?.industryType ?? opt?.categoryName ?? String(opt),
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Normalize options to { value, label, raw }
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    const hasSpecialOther = options.some(opt => String(getOptionValue(opt)) === '__other__');

    return options
      .filter((opt) => {
        const val = String(getOptionValue(opt));
        const lbl = String(getOptionLabel(opt) || '').trim().toLowerCase();
        // Remove plain database 'Other' option when special interactive '__other__' is present
        if (hasSpecialOther && val !== '__other__' && lbl === 'other') {
          return false;
        }
        return true;
      })
      .map((opt) => ({
        value: getOptionValue(opt),
        label: getOptionLabel(opt),
        raw: opt
      }));
  }, [options, getOptionValue, getOptionLabel]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      String(opt.label).toLowerCase().includes(q)
    );
  }, [normalizedOptions, search]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    } else {
      setSearch('');
    }
  }, [isOpen, searchable]);

  const handleSelect = (val, opt) => {
    onChange?.(val, opt?.raw);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const opt = filteredOptions[highlightedIndex];
        handleSelect(opt.value, opt);
      }
    }
  };

  const scrollIntoView = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-dropdown-item]');
    const item = items[index];
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded border px-3 py-2 text-sm text-left transition outline-none bg-white ${
          error
            ? 'border-rose-300 ring-2 ring-rose-100'
            : isOpen
              ? 'border-[#6658dd] ring-2 ring-indigo-50'
              : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-[#3f4254] cursor-pointer'} ${buttonClassName}`}
      >
        <span className={`truncate ${selectedOption ? 'font-medium text-[#3f4254]' : 'text-slate-400 font-normal'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 ml-2 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#6658dd]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-lg border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Optional Search Bar */}
          {searchable && normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/60 sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#6658dd] transition font-normal"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable list with max height of ~10 items */}
          <div
            ref={listRef}
            className="max-h-[360px] overflow-y-auto py-1 divide-y divide-slate-50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-slate-100"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;
                const isOther = opt.value === '__other__';

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    data-dropdown-item
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(opt.value, opt)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 font-bold text-[#6658dd]'
                        : isHighlighted
                          ? 'bg-slate-50 text-slate-900 font-medium'
                          : isOther
                            ? 'text-indigo-600 font-bold hover:bg-indigo-50/50'
                            : 'text-slate-700 font-normal hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-[#6658dd] ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdownSelect;

