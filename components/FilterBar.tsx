'use client';

import { Sparkles, Wifi, DollarSign, X } from 'lucide-react';

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
    shortLabel: 'Beginner',
    icon: Sparkles,
    active:
      'border-emerald-500/70 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/25 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950',
    inactive:
      'border-gray-200/90 dark:border-gray-600 bg-white/90 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50/80 dark:hover:bg-gray-800/90',
  },
  {
    key: 'remote' as keyof Filters,
    label: 'Remote',
    shortLabel: 'Remote',
    icon: Wifi,
    active:
      'border-blue-500/70 bg-blue-500/15 text-blue-800 dark:text-blue-200 shadow-sm ring-2 ring-blue-500/25 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950',
    inactive:
      'border-gray-200/90 dark:border-gray-600 bg-white/90 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50/80 dark:hover:bg-gray-800/90',
  },
  {
    key: 'paid' as keyof Filters,
    label: 'Paid',
    shortLabel: 'Paid',
    icon: DollarSign,
    active:
      'border-amber-500/70 bg-amber-500/15 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-500/25 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950',
    inactive:
      'border-gray-200/90 dark:border-gray-600 bg-white/90 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50/80 dark:hover:bg-gray-800/90',
  },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggle = (key: keyof Filters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasActive = activeCount > 0;

  const clearAll = () => {
    onChange({ beginnerFriendly: false, remote: false, paid: false });
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Refine results
      </p>
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Filter opportunities"
      >
        {filterConfig.map(({ key, label, shortLabel, icon: Icon, active, inactive }) => {
          const isOn = filters[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(key)}
              className={[
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950',
                'active:scale-[0.98]',
                isOn ? active : inactive,
              ].join(' ')}
            >
              <Icon size={13} className="flex-shrink-0 opacity-90" aria-hidden />
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}

        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 sm:py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:border-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={12} aria-hidden />
            Clear ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
