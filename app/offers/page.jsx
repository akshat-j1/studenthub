"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gift, SearchX, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
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

export default function StudentOffersPage() {
  const router = useRouter();
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

  const [votesMap, setVotesMap] = useState({});
  const [votedIds, setVotedIds] = useState(new Set());

  useEffect(() => {
    if (!supabase) return;

    const supabaseClient = supabase;
    let cancelled = false;

    const fetchAllData = async () => {
      // 1. Fetch opportunities
      const { data: oppsData } = await supabaseClient
        .from("opportunities")
        .select("*")
        .eq("type", "student_offer");

      // 2. Fetch all votes to count them
      const { data: allVotes } = await supabaseClient
        .from("offer_votes")
        .select("opportunity_id");

      // 3. Fetch user votes if authenticated
      let userVotes = [];
      if (user) {
        const { data } = await supabaseClient
          .from("offer_votes")
          .select("opportunity_id")
          .eq("user_id", user.id);
        userVotes = data || [];
      }

      if (!cancelled) {
        setOpportunities(oppsData || []);
        const newVotesMap = {};
        allVotes?.forEach((v) => {
          newVotesMap[v.opportunity_id] =
            (newVotesMap[v.opportunity_id] || 0) + 1;
        });
        setVotesMap(newVotesMap);

        const newVotedIds = new Set();
        userVotes?.forEach((v) => newVotedIds.add(v.opportunity_id));
        setVotedIds(newVotedIds);

        setIsLoading(false);
      }
    };

    fetchAllData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleVote = async (id) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const isVoting = !votedIds.has(id);

    // Optimistic UI update
    setVotedIds((prev) => {
      const newSet = new Set(prev);
      if (isVoting) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
    setVotesMap((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + (isVoting ? 1 : -1)),
    }));

    // DB Sync
    if (supabase) {
      if (isVoting) {
        const { error } = await supabase
          .from("offer_votes")
          .insert([{ user_id: user.id, opportunity_id: id }]);
        if (error) console.error("Failed to insert vote:", error);
      } else {
        const { error } = await supabase
          .from("offer_votes")
          .delete()
          .match({ user_id: user.id, opportunity_id: id });
        if (error) console.error("Failed to delete vote:", error);
      }
    }
  };

  const filteredItems = useMemo(
    () =>
      filterBySavedIds(
        applyFilters(opportunities, search, filters),
        savedIds,
        showSavedOnly,
      ),
    [opportunities, search, filters, savedIds, showSavedOnly],
  );

  const groupedOffers = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const cat = item.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sort items within each category by votes DESC
    for (const cat in groups) {
      groups[cat].sort((a, b) => {
        const votesA = votesMap[a.id] || 0;
        const votesB = votesMap[b.id] || 0;
        return votesB - votesA;
      });
    }

    return groups;
  }, [filteredItems, votesMap]);

  // Rank categories by total votes
  const sortedCategoryEntries = useMemo(() => {
    const entries = Object.entries(groupedOffers);
    return entries.sort((a, b) => {
      const [, itemsA] = a;
      const [, itemsB] = b;
      const sumA = itemsA.reduce(
        (sum, item) => sum + (votesMap[item.id] || 0),
        0,
      );
      const sumB = itemsB.reduce(
        (sum, item) => sum + (votesMap[item.id] || 0),
        0,
      );
      return sumB - sumA;
    });
  }, [groupedOffers, votesMap]);

  const formatCategory = (cat) => {
    if (cat.toLowerCase() === "ai_ml") return "AI / ML";
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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
              Student Offers
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
                availableFilters={["free"]}
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
              id="offers"
              title="Student Offers"
              subtitle="Free tools and perks for students"
              icon={Gift}
              count={filteredItems.length}
              gradient="from-emerald-500 to-teal-500"
            />
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="flex flex-col gap-12">
              {sortedCategoryEntries.map(([category, items], idx) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-5"
                >
                  <h2 className="rounded-l-sm border-l-4 border-indigo-500 pl-4 text-xl font-syne font-bold text-zinc-900 dark:text-white">
                    {formatCategory(category)}
                  </h2>
                  <div
                    className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide px-1"
                    style={{
                      maskImage:
                        "linear-gradient(to right, black 95%, transparent 100%)",
                    }}
                  >
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="min-w-[320px] w-full max-w-[350px] flex-shrink-0 snap-start"
                      >
                        <OpportunityCard
                          opportunity={item}
                          votes={votesMap[item.id] || 0}
                          hasVoted={votedIds.has(item.id)}
                          onVote={handleVote}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5">
                <SearchX className="text-zinc-500 dark:text-zinc-500" size={22} />
              </div>
              <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No student offers found
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
