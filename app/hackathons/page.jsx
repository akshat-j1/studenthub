"use client";

import { useState, useMemo, useEffect } from "react";
import { Trophy, SearchX, Bookmark } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import OpportunityCard from "@/components/OpportunityCard";
import SectionHeader from "@/components/SectionHeader";
import { useSavedIds } from "@/hooks/use-saved-ids";

import { supabase } from "@/lib/supabase";

function applyFilters(items, search, filters) {
  return items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        (Array.isArray(item.tags) &&
          item.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    if (filters.beginnerFriendly && !item.isBeginnerFriendly) return false;
    if (filters.remote && !item.isRemote) return false;
    if (filters.paid && !item.isPaid) return false;
    if (filters.free && item.isPaid) return false;
    return true;
  });
}

function filterBySavedIds(items, savedIds, enabled) {
  if (!enabled) return items;
  if (savedIds.length === 0) return [];
  const set = new Set(savedIds);
  return items.filter((o) => set.has(o.id));
}

export default function HackathonsPage() {
  const [search, setSearch] = useState("");
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [filters, setFilters] = useState({
    beginnerFriendly: false,
    remote: false,
    paid: false,
    free: false,
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { savedIds } = useSavedIds();

  useEffect(() => {
    if (!supabase) return;

    const supabaseClient = supabase;
    let cancelled = false;
    const fetchOpportunities = async () => {
      const { data, error } = await supabaseClient
        .from("opportunities")
        .select("*")
        .eq("type", "hackathon");
      if (!cancelled) {
        if (!error && data) {
          setOpportunities(data);
        }
        setIsLoading(false);
      }
    };

    fetchOpportunities();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(
    () =>
      filterBySavedIds(
        applyFilters(opportunities, search, filters),
        savedIds,
        showSavedOnly,
      ),
    [opportunities, search, filters, savedIds, showSavedOnly],
  );

  const clearSearchAndFilters = () => {
    setSearch("");
    setFilters({
      beginnerFriendly: false,
      remote: false,
      paid: false,
      free: false,
    });
    setShowSavedOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-center gap-4 max-w-2xl mx-auto w-full relative"
        >
          <div className="absolute top-0 w-full h-32 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />
          <h1 className="text-4xl sm:text-5xl font-syne font-bold tracking-tight text-center mb-2">
            All{" "}
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              Hackathons
            </span>
          </h1>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 w-full flex flex-col items-center gap-4">
            <div className="w-full">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="w-full">
              <FilterBar
                filters={filters}
                onChange={setFilters}
                availableFilters={["beginnerFriendly", "remote"]}
              />
            </div>
            <div className="w-full pt-2 border-t border-white/5">
              <button
                type="button"
                aria-pressed={showSavedOnly}
                onClick={() => setShowSavedOnly((v) => !v)}
                className={`inline-flex items-center justify-center w-full sm:w-auto mx-auto gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  showSavedOnly
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${showSavedOnly ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`}
                  strokeWidth={2}
                />
                Saved only
              </button>
            </div>
          </div>
        </motion.div>

        <section>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader
              id="hackathons"
              title="Hackathons"
              subtitle="Compete, build, and win prizes"
              icon={Trophy}
              count={filteredItems.length}
              gradient="from-blue-500 to-cyan-500"
              action={
                <Link
                  href="/post-hackathon"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  Post Hackathon
                </Link>
              }
            />
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <OpportunityCard opportunity={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <SearchX className="text-zinc-500" size={22} />
              </div>
              <p className="text-sm font-medium text-zinc-300 mb-1">
                No hackathons found
              </p>
              <button
                onClick={clearSearchAndFilters}
                className="text-sm text-indigo-400 hover:text-indigo-300 mt-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
