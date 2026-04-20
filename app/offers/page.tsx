'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, SearchX, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import FilterBar, { type Filters } from '@/components/FilterBar';
import OpportunityCard from '@/components/OpportunityCard';
import SectionHeader from '@/components/SectionHeader';
import { useSavedIds } from '@/hooks/use-saved-ids';

import type { Opportunity } from '@/lib/data';
import { supabase } from '@/lib/supabase';

function applyFilters(items: Opportunity[], search: string, filters: Filters): Opportunity[] {
  return items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    if (filters.beginnerFriendly && !item.isBeginnerFriendly) return false;
    if (filters.remote && !item.isRemote) return false;
    if (filters.paid && !item.isPaid) return false;
    if (filters.free && item.isPaid) return false;
    return true;
  });
}

function filterBySavedIds(items: Opportunity[], savedIds: string[], enabled: boolean): Opportunity[] {
  if (!enabled) return items;
  if (savedIds.length === 0) return [];
  const set = new Set(savedIds);
  return items.filter((o) => set.has(o.id));
}

export default function StudentOffersPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [filters, setFilters] = useState<Filters>({
    beginnerFriendly: false,
    remote: false,
    paid: false,
    free: false,
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { savedIds } = useSavedIds();

  const [votesMap, setVotesMap] = useState<Record<string, number>>({});
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!supabase) return;

    const supabaseClient = supabase;
    let cancelled = false;

    const fetchAllData = async () => {
      // 1. Fetch opportunities
      const { data: oppsData } = await supabaseClient
        .from('opportunities')
        .select('*')
        .eq('type', 'student_offer');

      // 2. Fetch all votes to count them
      const { data: allVotes } = await supabaseClient
        .from('offer_votes')
        .select('opportunity_id');

      // 3. Fetch user votes if authenticated
      let userVotes: { opportunity_id: string }[] = [];
      if (user) {
        const { data } = await supabaseClient
          .from('offer_votes')
          .select('opportunity_id')
          .eq('user_id', user.id);
        userVotes = data || [];
      }

      if (!cancelled) {
        setOpportunities((oppsData as Opportunity[]) || []);
        
        const newVotesMap: Record<string, number> = {};
        allVotes?.forEach(v => {
          newVotesMap[v.opportunity_id] = (newVotesMap[v.opportunity_id] || 0) + 1;
        });
        setVotesMap(newVotesMap);

        const newVotedIds = new Set<string>();
        userVotes?.forEach(v => newVotedIds.add(v.opportunity_id));
        setVotedIds(newVotedIds);

        setIsLoading(false);
      }
    };

    fetchAllData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleVote = async (id: string) => {
    if (!user) {
      router.push('/login');
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
      [id]: Math.max(0, (prev[id] || 0) + (isVoting ? 1 : -1))
    }));

    // DB Sync
    if (supabase) {
      if (isVoting) {
        const { error } = await supabase.from('offer_votes').insert([
          { user_id: user.id, opportunity_id: id }
        ]);
        if (error) console.error("Failed to insert vote:", error);
      } else {
        const { error } = await supabase.from('offer_votes')
          .delete()
          .match({ user_id: user.id, opportunity_id: id });
        if (error) console.error("Failed to delete vote:", error);
      }
    }
  };

  const filteredItems = useMemo(
    () => filterBySavedIds(applyFilters(opportunities, search, filters), savedIds, showSavedOnly),
    [opportunities, search, filters, savedIds, showSavedOnly]
  );

  const groupedOffers = useMemo(() => {
    const groups: Record<string, Opportunity[]> = {};
    filteredItems.forEach((item) => {
      const cat = item.category || 'other';
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
      const sumA = itemsA.reduce((sum, item) => sum + (votesMap[item.id] || 0), 0);
      const sumB = itemsB.reduce((sum, item) => sum + (votesMap[item.id] || 0), 0);
      return sumB - sumA;
    });
  }, [groupedOffers, votesMap]);

  const formatCategory = (cat: string) => {
    if (cat.toLowerCase() === 'ai_ml') return 'AI / ML';
    return cat
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const clearSearchAndFilters = () => {
    setSearch('');
    setFilters({ beginnerFriendly: false, remote: false, paid: false, free: false });
    setShowSavedOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-center gap-4 max-w-2xl mx-auto w-full relative"
        >
          <div className="absolute top-0 w-full h-32 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />
          <h1 className="text-4xl sm:text-5xl font-syne font-bold tracking-tight text-center mb-2">
            All{' '}
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              Student Offers
            </span>
          </h1>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 w-full flex flex-col items-center gap-4">
            <div className="w-full">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="w-full">
              <FilterBar filters={filters} onChange={setFilters} availableFilters={['free']} />
            </div>
            <div className="w-full pt-2 border-t border-white/5">
              <button
                type="button"
                aria-pressed={showSavedOnly}
                onClick={() => setShowSavedOnly((v) => !v)}
                className={`inline-flex items-center justify-center w-full sm:w-auto mx-auto gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  showSavedOnly
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${showSavedOnly ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} strokeWidth={2} />
                Saved only
              </button>
            </div>
          </div>
        </motion.div>

        <section>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
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
                <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
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
                  <h2 className="text-xl font-syne font-bold text-white pl-4 border-l-4 border-indigo-500 rounded-l-sm">
                    {formatCategory(category)}
                  </h2>
                  <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide px-1" style={{ maskImage: 'linear-gradient(to right, black 95%, transparent 100%)' }}>
                    {items.map((item) => (
                      <div key={item.id} className="min-w-[320px] w-full max-w-[350px] flex-shrink-0 snap-start">
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
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <SearchX className="text-zinc-500" size={22} />
              </div>
              <p className="text-sm font-medium text-zinc-300 mb-1">No student offers found</p>
              <button onClick={clearSearchAndFilters} className="text-sm text-indigo-400 hover:text-indigo-300 mt-2">Clear filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
