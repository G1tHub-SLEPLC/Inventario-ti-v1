import { useState, useRef, useEffect, useMemo } from 'react';

export default function AutocompleteInput({ 
  name,
  value, 
  onChange, 
  options, // array of objects { label: '...', value: '...', sublabel: '...' } or strings
  placeholder,
  className,
  onSelectOption
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const formattedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt; // assume { label, value, sublabel }
    });
  }, [options]);

  const filteredOptions = useMemo(() => {
    const q = (value || '').toLowerCase().trim();
    if (!q) return formattedOptions;
    return formattedOptions.filter(o => 
      o.label.toLowerCase().includes(q) || 
      (o.sublabel && o.sublabel.toLowerCase().includes(q))
    );
  }, [formattedOptions, value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        e.preventDefault();
        const selected = filteredOptions[activeIndex];
        if (onSelectOption) {
          onSelectOption(selected);
        } else {
          onChange({ target: { name: name || 'auto', value: selected.value } });
        }
        setIsOpen(false);
        setActiveIndex(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const val = (value || '').trim();
        if (val) {
          if (onSelectOption) {
            onSelectOption({ label: val, value: val });
          } else {
            onChange({ target: { name: name || 'auto', value: val } });
          }
          setIsOpen(false);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => {
          onChange(e);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        className={className}
        placeholder={placeholder}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No hay coincidencias</div>
          ) : (
            filteredOptions.map((opt, idx) => (
              <div
                key={opt.value + idx}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur
                  if (onSelectOption) {
                    onSelectOption(opt);
                  } else {
                    onChange({ target: { name: name || 'auto', value: opt.value } });
                  }
                  setIsOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-3 py-2 text-sm cursor-pointer flex flex-col ${activeIndex === idx ? 'bg-blue-100 text-[#006BB9]' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                <span className="font-semibold">{opt.label}</span>
                {opt.sublabel && <span className="text-xs text-gray-400">{opt.sublabel}</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
