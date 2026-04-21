"use client";

import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5">
      <Search size={18} className="text-indigo-500/70 flex-shrink-0" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search hackathons, internships, offers..."
        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-white"
      />

      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange("")}
            className="absolute right-3 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Clear search"
          >
            <X size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
