'use client';

import { Sparkles, Wifi, DollarSign } from 'lucide-react';

export type Filters = {
  beginnerFriendly: boolean;
  remote: boolean;
  paid: boolean;
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const filterConfig = [
  {
    key: 'beginnerFriendly' as keyof Filters,
    label: 'Beginner-friendly',
    icon: Sparkles,
    activeClass: 'bg-emerald-500/10 border-emerald-400/60 text-emerald-600 dark:text-emerald-400',
    inactiveClass: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
  },
  {
    key: 'remote' as keyof Filters,
    label: 'Remote',
    icon: Wifi,
    activeClass: 'bg-blue-500/10 border-blue-400/60 text-blue-600 dark:text-blue-400',
    inactiveClass: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
  },
  {
    key: 'paid' as keyof Filters,
    label: 'Paid',
    icon: DollarSign,
    activeClass: 'bg-amber-500/10 border-amber-400/60 text-amber-600 dark:text-amber-400',
    inactiveClass: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
  },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggle = (key: keyof Filters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const hasActive = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2.5 justify-center">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">Filters:</span>
      {filterConfig.map(({ key, label, icon: Icon, activeClass, inactiveClass }) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all duration-150 ${
            filters[key] ? activeClass : inactiveClass
          } hover:shadow-sm`}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
      {hasActive && (
        <button
          onClick={() => onChange({ beginnerFriendly: false, remote: false, paid: false })}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
