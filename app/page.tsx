'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trophy, Briefcase, Gift, Zap, Users, Star, SearchX, Bookmark, Clock3, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import FilterBar, { type Filters } from '@/components/FilterBar';
import OpportunityCard from '@/components/OpportunityCard';
import SectionHeader from '@/components/SectionHeader';
import { useSavedIds } from '@/hooks/use-saved-ids';

import { opportunities as localOpportunities } from '@/lib/data';
import type { Opportunity } from '@/lib/data';
import { supabase, supabaseConfigError } from '@/lib/supabase';

const statsData = [
  { label: 'Active Hackathons', value: '50+', icon: Trophy, color: 'text-blue-500' },
  { label: 'Open Internships', value: '200+', icon: Briefcase, color: 'text-violet-500' },
  { label: 'Student Offers', value: '100+', icon: Gift, color: 'text-emerald-500' },
  { label: 'Students Helped', value: '10K+', icon: Users, color: 'text-amber-500' },
];

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

export default function Home() {
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
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const { savedIds } = useSavedIds();

  useEffect(() => {
    if (!supabase) return;
    const supabaseClient = supabase;

    let cancelled = false;

    const fetchOpportunities = async () => {
      const { data, error } = await supabaseClient.from('opportunities').select('*');

      if (!cancelled) {
        if (error || !data || data.length === 0) {
          setOpportunities(localOpportunities);
        } else {
          setOpportunities(data as Opportunity[]);
        }
        setIsLoading(false);
      }
    };

    fetchOpportunities();

    return () => {
      cancelled = true;
    };
  }, []);

  const hackathons = useMemo(() => opportunities.filter((o) => o.type === 'hackathon'), [opportunities]);
  const internships = useMemo(() => opportunities.filter((o) => o.type === 'internship'), [opportunities]);
  const studentOffers = useMemo(() => opportunities.filter((o) => o.type === 'student_offer'), [opportunities]);

  const filteredHackathons = useMemo(
    () => filterBySavedIds(applyFilters(hackathons, search, filters), savedIds, showSavedOnly),
    [hackathons, search, filters, savedIds, showSavedOnly]
  );
  const filteredInternships = useMemo(
    () => filterBySavedIds(applyFilters(internships, search, filters), savedIds, showSavedOnly),
    [internships, search, filters, savedIds, showSavedOnly]
  );
  const filteredOffers = useMemo(
    () => filterBySavedIds(applyFilters(studentOffers, search, filters), savedIds, showSavedOnly),
    [studentOffers, search, filters, savedIds, showSavedOnly]
  );
  const endingSoonItems = useMemo(
    () =>
      [...filteredHackathons, ...filteredInternships, ...filteredOffers]
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5),
    [filteredHackathons, filteredInternships, filteredOffers]
  );
  const currentOpportunityList = useMemo(
    () => [...filteredHackathons, ...filteredInternships, ...filteredOffers],
    [filteredHackathons, filteredInternships, filteredOffers]
  );

  const totalResults = filteredHackathons.length + filteredInternships.length + filteredOffers.length;
  const hasActiveQuery = search.trim().length > 0 || Object.values(filters).some(Boolean) || showSavedOnly;
  const noSavedBookmarks = showSavedOnly && savedIds.length === 0;
  const noMatches = totalResults === 0 && hasActiveQuery && !noSavedBookmarks;

  const clearSearchAndFilters = () => {
    setSearch('');
    setFilters({ beginnerFriendly: false, remote: false, paid: false, free: false });
    setShowSavedOnly(false);
  };

  const getAiRecommendations = async () => {
    setAiError('');
    setAiResult('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunities: currentOpportunityList }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setAiError(payload?.error ?? 'Failed to fetch AI recommendations.');
        return;
      }

      setAiResult(payload?.result ?? 'No recommendations generated.');
    } catch {
      setAiError('Failed to fetch AI recommendations.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] transition-colors duration-300">
      <Navbar />

      {/* Hero */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative pt-32 pb-12 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
          <div className="absolute top-0 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400 mb-8"
          >
            <Zap size={12} className="text-amber-400" />
            The #1 platform for student opportunities
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-syne font-bold tracking-tight mb-6 leading-tight">
            Discover Your Next
            <span className="block bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent pb-2">
              Big Opportunity
            </span>
          </h1>

          <p className="text-lg sm:text-xl font-dm-sans text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Hackathons, internships, and exclusive student offers — all in one place.
            Find opportunities that match your skills and goals.
          </p>

          <motion.div 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden" animate="show"
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 max-w-2xl mx-auto flex flex-col items-center gap-4"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="w-full">
              <SearchBar value={search} onChange={setSearch} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="w-full">
              <FilterBar filters={filters} onChange={setFilters} availableFilters={['beginnerFriendly', 'remote', 'paid', 'free']} />
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="w-full pt-2 border-t border-white/5">
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
            </motion.div>
          </motion.div>

          {hasActiveQuery && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-sm text-zinc-400">
              {noMatches ? (
                <>
                  <span className="font-semibold text-white">0</span> results
                  {search.trim() && <> for <span className="text-indigo-400">&quot;{search}&quot;</span></>}
                </>
              ) : (
                <>
                  Showing <span className="font-semibold text-white">{totalResults}</span> results
                  {search.trim() && <> for <span className="text-indigo-400">&quot;{search}&quot;</span></>}
                </>
              )}
            </motion.p>
          )}
        </div>
      </motion.section>

      {/* AI Recommendations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-8">
        <motion.div 
          whileInView={{ opacity: 1, scale: 1 }} 
          initial={{ opacity: 0, scale: 0.97 }} 
          viewport={{ once: true }}
          className="bg-gradient-to-br from-indigo-950/40 to-[#09090b] border border-indigo-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden card-glow"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-syne font-bold text-white">AI Recommendations</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Powered by Gemini
                </span>
              </div>
              <p className="text-sm font-dm-sans text-indigo-200/70">
                Get personalized, intelligent recommendations based on your current filters and searches.
              </p>
            </div>
            <button
              type="button"
              onClick={getAiRecommendations}
              disabled={aiLoading || currentOpportunityList.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Get Insights</>}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {aiError && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
                {aiError}
              </motion.div>
            )}

            {aiLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-3">
                <div className="h-4 bg-indigo-500/10 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-indigo-500/10 rounded animate-pulse w-full" />
                <div className="h-4 bg-indigo-500/10 rounded animate-pulse w-5/6" />
              </motion.div>
            )}

            {!aiLoading && aiResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl border border-indigo-500/20 bg-[#111318]/50 backdrop-blur-sm px-6 py-5 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-dm-sans">
                {aiResult}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Ending Soon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Urgent
            </div>
            <h2 className="text-2xl sm:text-3xl font-syne font-bold text-white">
              Deadlines approaching fast
            </h2>
            <p className="mt-2 text-sm font-dm-sans text-zinc-400">
              The top 5 opportunities closing soonest across all categories.
            </p>
          </div>
        </div>

        {endingSoonItems.length > 0 ? (
          <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {endingSoonItems.map((item) => (
              <motion.div key={`ending-${item.id}`} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="relative">
                <div className="absolute -top-3 -right-3 z-30">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/30 bg-[#09090b] text-[10px] font-bold uppercase tracking-wider text-red-400 shadow-xl">
                    <Clock3 size={10} />
                    Ending Soon
                  </span>
                </div>
                <OpportunityCard opportunity={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#111318] px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-400">
              No upcoming deadlines match your current search and filters.
            </p>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
        {supabaseConfigError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-sm text-red-400">
            {supabaseConfigError}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : noSavedBookmarks ? (
          <SavedBookmarksEmptyState onExit={() => setShowSavedOnly(false)} />
        ) : noMatches ? (
          <NoResultsEmptyState onClear={clearSearchAndFilters} searchQuery={search.trim()} />
        ) : (
          <PreviewSections
            filteredHackathons={filteredHackathons}
            filteredInternships={filteredInternships}
            filteredOffers={filteredOffers}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
              <Star size={12} className="text-white" />
            </div>
            <span className="text-sm font-syne font-semibold text-white">
              Student<span className="text-indigo-500">Hub</span>
            </span>
          </div>
          <p className="text-xs font-dm-sans text-zinc-500">
            Empowering students to find their next big break. All data is for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, index }: any) {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/\D/g, '')) || 0;
  const suffix = value.replace(/\d/g, '');

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#111318] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm"
    >
      <div className={`p-3 rounded-full bg-white/5 ${color}`}>
        <Icon size={24} />
      </div>
      <div className="text-center">
        <p className="text-3xl font-syne font-bold text-white">
          {count}{suffix}
        </p>
        <p className="text-sm font-dm-sans text-zinc-400 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

function PreviewSections({
  filteredHackathons,
  filteredInternships,
  filteredOffers,
}: {
  filteredHackathons: Opportunity[];
  filteredInternships: Opportunity[];
  filteredOffers: Opportunity[];
}) {
  return (
    <>
      {/* Hackathons Preview */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <SectionHeader
            id="hackathons"
            title="Hackathons"
            subtitle="Compete, build, and win prizes"
            icon={Trophy}
            count={filteredHackathons.length}
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
        {filteredHackathons.length > 0 ? (
          <>
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHackathons.slice(0, 3).map((item) => (
                <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <OpportunityCard opportunity={item} />
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8 flex justify-center">
              <Link href="/hackathons" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
                View All Hackathons
              </Link>
            </div>
          </>
        ) : (
          <EmptyState type="hackathons" />
        )}
      </section>

      <div className="border-t border-white/5" />

      {/* Internships Preview */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <SectionHeader
            id="internships"
            title="Internships"
            subtitle="Launch your career with top companies"
            icon={Briefcase}
            count={filteredInternships.length}
            gradient="from-violet-500 to-blue-500"
          />
        </motion.div>
        {filteredInternships.length > 0 ? (
          <>
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.slice(0, 3).map((item) => (
                <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <OpportunityCard opportunity={item} />
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8 flex justify-center">
              <Link href="/internships" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
                View All Internships
              </Link>
            </div>
          </>
        ) : (
          <EmptyState type="internships" />
        )}
      </section>

      <div className="border-t border-white/5" />

      {/* Student Offers Preview */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <SectionHeader
            id="offers"
            title="Student Offers"
            subtitle="Free tools and perks for students"
            icon={Gift}
            count={filteredOffers.length}
            gradient="from-emerald-500 to-teal-500"
          />
        </motion.div>
        {filteredOffers.length > 0 ? (
          <>
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.slice(0, 3).map((item) => (
                <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <OpportunityCard opportunity={item} />
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8 flex justify-center">
              <Link href="/offers" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
                View All Student Offers
              </Link>
            </div>
          </>
        ) : (
          <EmptyState type="student offers" />
        )}
      </section>
    </>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Star size={22} className="text-zinc-600" />
      </div>
      <p className="text-sm font-medium text-zinc-300 mb-1">No {type} found</p>
      <p className="text-xs text-zinc-500">Try adjusting your search or filters</p>
    </div>
  );
}

function SavedBookmarksEmptyState({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] shadow-sm px-8 py-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <Bookmark className="h-8 w-8 text-amber-500" strokeWidth={2} aria-hidden />
        </div>
        <h2 className="text-lg font-syne font-semibold text-white mb-2">No saved opportunities yet</h2>
        <p className="text-sm font-dm-sans text-zinc-400 leading-relaxed mb-6">
          Use the bookmark icon on any card to save it here. Saved items stay on this device.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
        >
          Browse all opportunities
        </button>
      </div>
    </div>
  );
}

function NoResultsEmptyState({ onClear, searchQuery }: { onClear: () => void; searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] shadow-sm px-8 py-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <SearchX className="h-8 w-8 text-zinc-500" aria-hidden />
        </div>
        <h2 className="text-lg font-syne font-semibold text-white mb-2">No opportunities match your filters</h2>
        <p className="text-sm font-dm-sans text-zinc-400 leading-relaxed mb-6">
          {searchQuery ? (
            <>Nothing matched &quot;{searchQuery}&quot; with your current filters. Try different keywords or relax your filters.</>
          ) : (
            <>Nothing matched your current filters. Try turning off a filter to see more opportunities.</>
          )}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-colors"
        >
          Clear search & filters
        </button>
      </div>
    </div>
  );
}
