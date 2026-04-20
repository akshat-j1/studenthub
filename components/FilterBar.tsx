'use client';

import { Sparkles, Wifi, DollarSign, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type Filters = {
  beginnerFriendly: boolean;
  remote: boolean;
  paid: boolean;
  free: boolean;
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  availableFilters?: Array<keyof Filters>;
}

const filterConfig = [
  {
    key: 'beginnerFriendly' as keyof Filters,
    label: 'Beginner-friendly',
    shortLabel: 'Beginner',
    icon: Sparkles,
  },
  {
    key: 'remote' as keyof Filters,
    label: 'Remote',
    shortLabel: 'Remote',
    icon: Wifi,
  },
  {
    key: 'paid' as keyof Filters,
    label: 'Paid',
    shortLabel: 'Paid',
    icon: DollarSign,
  },
  {
    key: 'free' as keyof Filters,
    label: 'Free',
    shortLabel: 'Free',
    icon: Tag,
  },
];

export default function FilterBar({ filters, onChange, availableFilters }: FilterBarProps) {
  const toggle = (key: keyof Filters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasActive = activeCount > 0;

  const clearAll = () => {
    onChange({ beginnerFriendly: false, remote: false, paid: false, free: false });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto mt-4">
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Filter opportunities"
      >
        {(availableFilters ? filterConfig.filter(f => availableFilters.includes(f.key)) : filterConfig).map(({ key, label, shortLabel, icon: Icon }) => {
          const isOn = filters[key];
          return (
            <motion.button
              key={key}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                isOn ? 'text-indigo-300' : 'text-zinc-400 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {isOn && (
                <motion.span
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/40 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <Icon size={14} className="flex-shrink-0 relative z-10" aria-hidden />
              <span className="sm:hidden relative z-10">{shortLabel}</span>
              <span className="hidden sm:inline relative z-10">{label}</span>
            </motion.button>
          );
        })}

        <AnimatePresence>
          {hasActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-zinc-600 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-400 hover:bg-white/5 transition-colors overflow-hidden"
            >
              <X size={12} aria-hidden />
              <span className="whitespace-nowrap">Clear ({activeCount})</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
