import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export function SortableHeader({ label, sortKey, currentKey, currentDir, onSort, className = '' }) {
  const isActive = currentKey === sortKey;
  return (
    <th
      className={`cursor-pointer select-none group py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-slate-100 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'}`}>
          {isActive ? (
            currentDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          ) : (
            <ChevronsUpDown size={12} />
          )}
        </span>
      </div>
    </th>
  );
}
