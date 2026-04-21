"use client";

import { Sparkles, Wifi, DollarSign, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const filterConfig = [
  {
    key: "beginnerFriendly",
    label: "Beginner-friendly",
    shortLabel: "Beginner",
    icon: Sparkles,
  },
  {
    key: "remote",
    label: "Remote",
    shortLabel: "Remote",
    icon: Wifi,
  },
  {
    key: "paid",
    label: "Paid",
    shortLabel: "Paid",
    icon: DollarSign,
  },
  {
    key: "free",
    label: "Free",
    shortLabel: "Free",
    icon: Tag,
  },
];

export default function FilterBar({ filters, onChange, availableFilters }) {
  const toggle = (key) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasActive = activeCount > 0;

  const clearAll = () => {
    onChange({
      beginnerFriendly: false,
      remote: false,
      paid: false,
      free: false,
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto mt-4">
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Filter opportunities"
      >
        {(availableFilters
          ? filterConfig.filter((f) => availableFilters.includes(f.key))
          : filterConfig
        ).map(({ key, label, shortLabel, icon: Icon }) => {
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
                isOn
                  ? "text-indigo-600 dark:text-indigo-300"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {isOn && (
                <motion.span
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/40 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <Icon
                size={14}
                className="flex-shrink-0 relative z-10"
                aria-hidden
              />
              <span className="sm:hidden relative z-10">{shortLabel}</span>
              <span className="hidden sm:inline relative z-10">{label}</span>
            </motion.button>
          );
        })}

        <AnimatePresence>
          {hasActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-dashed border-zinc-300 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
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
