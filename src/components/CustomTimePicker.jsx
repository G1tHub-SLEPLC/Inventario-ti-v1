import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CustomTimePicker({
  value = '',
  onChange,
  placeholder = 'Seleccionar hora',
  required = false,
  className = '',
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Generate hours: "00", "01", ..., "23"
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  
  // Generate minutes: "00", "01", ..., "59"
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current system hour and minute as defaults if value is empty
  const defaultHour = String(new Date().getHours()).padStart(2, '0');
  const defaultMinute = String(new Date().getMinutes()).padStart(2, '0');

  const currentHour = value && value.includes(':') ? value.split(':')[0] : defaultHour;
  const currentMinute = value && value.includes(':') ? value.split(':')[1] : defaultMinute;

  // Scroll active elements into view when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const activeHourBtn = containerRef.current?.querySelector('.active-hour');
        const activeMinBtn = containerRef.current?.querySelector('.active-minute');
        if (activeHourBtn) {
          activeHourBtn.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
        if (activeMinBtn) {
          activeMinBtn.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
      }, 50);
    }
  }, [isOpen]);

  const handleHourSelect = (h) => {
    const min = currentMinute || '00';
    onChange(`${h}:${min}`);
  };

  const handleMinuteSelect = (m) => {
    const hr = currentHour || '12';
    onChange(`${hr}:${m}`);
    setIsOpen(false); // Close dropdown immediately when minutes are clicked!
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          required={required}
          value={value}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded-lg border-gray-300 shadow-sm border p-2.5 pr-10 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white cursor-pointer select-none ${className}`}
        />
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-600"
        >
          <Clock size={16} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 flex gap-2 h-56 animate-slide-in">
          {/* Hour Column */}
          <div className="flex-1 flex flex-col border-r border-gray-100 pr-1 h-full overflow-hidden">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block px-2 text-center select-none">Hora</span>
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-0.5">
              {hours.map((h) => {
                const isSelected = currentHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`w-full text-center py-1.5 text-xs font-semibold rounded transition-colors block mb-0.5 ${
                      isSelected
                        ? 'bg-[#006BB9] text-white active-hour'
                        : 'text-gray-700 hover:bg-slate-100'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minute Column */}
          <div className="flex-1 flex flex-col pl-1 h-full overflow-hidden">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block px-2 text-center select-none">Minuto</span>
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-0.5">
              {minutes.map((m) => {
                const isSelected = currentMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteSelect(m)}
                    className={`w-full text-center py-1.5 text-xs font-semibold rounded transition-colors block mb-0.5 ${
                      isSelected
                        ? 'bg-[#006BB9] text-white active-minute'
                        : 'text-gray-700 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
