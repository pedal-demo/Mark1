import React, { useRef, useEffect, useState } from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  locked?: boolean;
  onUnlock?: () => void;
  showSelectButton?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Add location...',
  className = '',
  locked = false,
  onUnlock,
  showSelectButton = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounced, setDebounced] = useState('');
  const suppressUntilRef = useRef<number>(0);

  // Debounce user input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 250);
    return () => clearTimeout(t);
  }, [value]);

  // Fetch suggestions from OpenStreetMap Nominatim
  useEffect(() => {
    const q = (debounced || '').trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // Suppress fetch briefly right after selection to avoid immediate re-open
    if (Date.now() < suppressUntilRef.current) {
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({
      q,
      format: 'json',
      addressdetails: '1',
      limit: '8',
      countrycodes: 'in', // bias to India for pincodes
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(async (r) => (r.ok ? r.json() : []))
      .then((data: any[]) => {
        if (!Array.isArray(data)) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const items = data.map((d) => d.display_name as string).filter(Boolean);
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      })
      .catch(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      });
    return () => controller.abort();
  }, [debounced]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setActiveIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveIndex(-1);
    if (onSelect) onSelect(suggestion);
    // Don't blur the input - keep it focused so user can see the selection
    suppressUntilRef.current = Date.now() + 500;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && activeIndex >= 0) {
        handleSuggestionClick(suggestions[activeIndex]);
      } else if (value.trim()) {
        // If no suggestion selected but has value, treat as manual selection
        setShowSuggestions(false);
        setSuggestions([]);
        setActiveIndex(-1);
        if (onSelect) onSelect(value);
        // Keep input focused so user can see the selection
        suppressUntilRef.current = Date.now() + 500;
      }
      return;
    }
    
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        readOnly={locked}
        disabled={false}
        onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && !locked && (
        <ul className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 shadow-lg max-h-52 overflow-auto">
          {suggestions.map((suggestion, idx) => (
            <li
              key={suggestion}
              className={`px-4 py-2 cursor-pointer text-white hover:bg-orange-500/20 ${idx === activeIndex ? 'bg-orange-500/30' : ''}`}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {/* Controls: Select / Change */}
      <div className="mt-2 flex items-center justify-between">
        {!locked && showSelectButton && (
          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-500 transition"
            onClick={() => {
              setShowSuggestions(false);
              setSuggestions([]);
              setActiveIndex(-1);
              if (onSelect) onSelect(value);
              // Keep input focused so user can see the selection
              suppressUntilRef.current = Date.now() + 500;
            }}
            disabled={!value?.trim()}
          >
            Select
          </button>
        )}
        {locked && (
          <div className="w-full flex items-center justify-between text-xs text-gray-300">
            <span className="px-2 py-1 rounded bg-gray-700/60 border border-gray-600">Location selected</span>
            {onUnlock && (
              <button
                type="button"
                className="text-orange-400 hover:text-orange-300"
                onClick={() => onUnlock()}
              >
                Change
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAutocomplete;
