"use client";

import { useState, useMemo, useEffect } from "react";
import { Briefcase, SearchX, Bookmark } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import OpportunityCard from "@/components/OpportunityCard";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedIds } from "@/hooks/use-saved-ids";

import { getCurrentUserProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { attachCreatorProfiles } from "@/lib/opportunityProfiles";

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

export default function InternshipsPage() {
  const { user } = useAuth();
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
  const [roleLoading, setRoleLoading] = useState(true);
  const [canPostInternship, setCanPostInternship] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const supabaseClient = supabase;
    let cancelled = false;
    const fetchOpportunities = async () => {
      const { data, error } = await supabaseClient
        .from("opportunities")
        .select("*")
        .eq("type", "internship");
      if (!cancelled) {
        if (!error && data) {
          const opportunitiesWithProfiles = await attachCreatorProfiles(
            supabaseClient,
            data,
          );
          setOpportunities(opportunitiesWithProfiles);
        }
        setIsLoading(false);
      }
    };

    fetchOpportunities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadRole = async () => {
      if (!user) {
        if (!active) return;
        setCanPostInternship(false);
        setRoleLoading(false);
        return;
      }

      const { profile } = await getCurrentUserProfile();
      if (!active) return;

      const role = profile?.role?.toLowerCase();
      setCanPostInternship(role === "employer" || role === "teacher");
      setRoleLoading(false);
    };

    setRoleLoading(true);
    loadRole();

    return () => {
      active = false;
    };
  }, [user]);

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
    <div className="min-h-screen bg-zinc-50 transition-colors duration-300 dark:bg-[#09090b]">
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
            <span className="bg-gradient-to-r from-zinc-900 via-indigo-500 to-zinc-900 bg-clip-text text-transparent dark:from-white dark:via-indigo-200 dark:to-white">
              Internships
            </span>
          </h1>

          <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="w-full">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="w-full">
              <FilterBar
                filters={filters}
                onChange={setFilters}
                availableFilters={["beginnerFriendly", "remote", "paid"]}
              />
            </div>
            <div className="w-full border-t border-zinc-200 pt-2 dark:border-white/5">
              <button
                type="button"
                aria-pressed={showSavedOnly}
                onClick={() => setShowSavedOnly((v) => !v)}
                className={`inline-flex items-center justify-center w-full sm:w-auto mx-auto gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  showSavedOnly
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${showSavedOnly ? "fill-amber-400 text-amber-400" : "text-zinc-600 dark:text-zinc-400"}`}
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
              id="internships"
              title="Internships"
              subtitle="Launch your career with top companies"
              icon={Briefcase}
              count={filteredItems.length}
              gradient="from-violet-500 to-blue-500"
              action={
                !roleLoading && canPostInternship ? (
                  <Link
                    href="/post-internship"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-colors hover:bg-indigo-400"
                  >
                    Post Internship
                  </Link>
                ) : null
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
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5">
                <SearchX className="text-zinc-500 dark:text-zinc-500" size={22} />
              </div>
              <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No internships found
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
