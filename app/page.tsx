'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trophy, Briefcase, Gift, Zap, Users, Star, SearchX, Bookmark, Clock3 } from 'lucide-react';

import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import FilterBar, { type Filters } from '@/components/FilterBar';
import OpportunityCard from '@/components/OpportunityCard';
import SectionHeader from '@/components/SectionHeader';
import { useSavedIds } from '@/hooks/use-saved-ids';

import type { Opportunity } from '@/lib/data';

const statsData = [
  { label: 'Active Hackathons', value: '50+', icon: Trophy, color: 'text-blue-500' },
  { label: 'Open Internships', value: '200+', icon: Briefcase, color: 'text-violet-500' },
  { label: 'Student Offers', value: '100+', icon: Gift, color: 'text-emerald-500' },
  { label: 'Students Helped', value: '10K+', icon: Users, color: 'text-amber-500' },
];
const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_STEP = 6;

function applyFilters(items: Opportunity[], search: string, filters: Filters): Opportunity[] {
  return items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.beginnerFriendly && !item.isBeginnerFriendly) return false;
    if (filters.remote && !item.isRemote) return false;
    if (filters.paid && !item.isPaid) return false;
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [search, setSearch] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    beginnerFriendly: false,
    remote: false,
    paid: false,
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { savedIds } = useSavedIds();

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  useEffect(() => {
    let cancelled = false;

    const loadOpportunities = async () => {
      try {
        const response = await fetch('/api/opportunities');
        if (!response.ok) throw new Error('Failed to fetch opportunities');
        const data = (await response.json()) as Opportunity[];
        if (!cancelled) {
          setOpportunities(data);
        }
      } catch {
        if (!cancelled) {
          setOpportunities([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOpportunities();

    return () => {
      cancelled = true;
    };
  }, []);

  const hackathons = useMemo(
    () => opportunities.filter((o) => o.type === 'hackathon'),
    [opportunities]
  );
  const internships = useMemo(
    () => opportunities.filter((o) => o.type === 'internship'),
    [opportunities]
  );
  const studentOffers = useMemo(
    () => opportunities.filter((o) => o.type === 'offer'),
    [opportunities]
  );

  const filteredHackathons = useMemo(
    () => filterBySavedIds(applyFilters(hackathons, search, filters), savedIds, showSavedOnly),
    [search, filters, savedIds, showSavedOnly]
  );
  const filteredInternships = useMemo(
    () => filterBySavedIds(applyFilters(internships, search, filters), savedIds, showSavedOnly),
    [search, filters, savedIds, showSavedOnly]
  );
  const filteredOffers = useMemo(
    () => filterBySavedIds(applyFilters(studentOffers, search, filters), savedIds, showSavedOnly),
    [search, filters, savedIds, showSavedOnly]
  );
  const endingSoonItems = useMemo(
    () =>
      [...filteredHackathons, ...filteredInternships, ...filteredOffers]
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 6),
    [filteredHackathons, filteredInternships, filteredOffers]
  );

  const totalResults = filteredHackathons.length + filteredInternships.length + filteredOffers.length;

  const hasActiveQuery =
    search.trim().length > 0 || Object.values(filters).some(Boolean) || showSavedOnly;
  const noSavedBookmarks = showSavedOnly && savedIds.length === 0;
  const noMatches = totalResults === 0 && hasActiveQuery && !noSavedBookmarks;

  const clearSearchAndFilters = () => {
    setSearch('');
    setFilters({
      beginnerFriendly: false,
      remote: false,
      paid: false,
    });
    setShowSavedOnly(false);
  };

  const paginationResetKey = `${search}|${filters.beginnerFriendly}|${filters.remote}|${filters.paid}|${showSavedOnly}|${savedIds.join(',')}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar theme={theme} onThemeToggle={toggleTheme} />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 dark:bg-blue-950/40 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-100 dark:bg-cyan-950/40 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400 mb-6">
            <Zap size={12} />
            The #1 platform for student opportunities
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-5 leading-tight">
            Discover Your Next
            <span className="block bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Big Opportunity
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hackathons, internships, and exclusive student offers — all in one place.
            Find opportunities that match your skills and goals.
          </p>

          <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto w-full">
            <SearchBar value={search} onChange={setSearch} />
            <FilterBar filters={filters} onChange={setFilters} />
            <button
              type="button"
              aria-pressed={showSavedOnly}
              onClick={() => setShowSavedOnly((v) => !v)}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950',
                'active:scale-[0.98]',
                showSavedOnly
                  ? 'border-amber-500/70 bg-amber-500/15 text-amber-900 dark:text-amber-100 shadow-sm ring-2 ring-amber-500/25 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950'
                  : 'border-gray-200/90 dark:border-gray-600 bg-white/90 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ].join(' ')}
            >
              <Bookmark
                className={`h-3.5 w-3.5 ${showSavedOnly ? 'fill-amber-400 text-amber-600 dark:fill-amber-400 dark:text-amber-300' : 'fill-transparent text-gray-500 dark:text-gray-400'}`}
                strokeWidth={2}
              />
              Saved only
            </button>
          </div>

          {hasActiveQuery && (
            <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
              {noMatches ? (
                <>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span> results
                  {search.trim() && (
                    <> for <span className="font-semibold text-blue-500">&quot;{search}&quot;</span></>
                  )}
                </>
              ) : (
                <>
                  Showing <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span> results
                  {search.trim() && (
                    <> for <span className="font-semibold text-blue-500">&quot;{search}&quot;</span></>
                  )}
                </>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Ending Soon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 dark:border-rose-800/70 bg-rose-50/80 dark:bg-rose-950/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
              <Clock3 size={12} />
              Ending Soon
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Deadlines approaching fast
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The next opportunities closing soonest across all categories.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800/70">
            Top {endingSoonItems.length}
          </span>
        </div>

        {endingSoonItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {endingSoonItems.map((item) => (
              <div key={`ending-${item.id}`} className="relative">
                <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-rose-200 dark:border-rose-800/70 bg-rose-50/95 dark:bg-rose-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
                  Ending Soon
                </span>
                <OpportunityCard opportunity={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/60 px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No upcoming deadlines match the current search and filters.
            </p>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
        {isLoading ? (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : noSavedBookmarks ? (
          <SavedBookmarksEmptyState onExit={() => setShowSavedOnly(false)} />
        ) : noMatches ? (
          <NoResultsEmptyState onClear={clearSearchAndFilters} searchQuery={search.trim()} />
        ) : (
          <PaginatedSections
            key={paginationResetKey}
            filteredHackathons={filteredHackathons}
            filteredInternships={filteredInternships}
            filteredOffers={filteredOffers}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Star size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Student<span className="text-blue-500">Hub</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Empowering students to find their next big break. All data is for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Star size={22} className="text-gray-400 dark:text-gray-600" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No {type} found</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
    </div>
  );
}

function SavedBookmarksEmptyState({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/80 shadow-sm px-8 py-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/50 dark:to-gray-800/80">
          <Bookmark
            className="h-8 w-8 fill-transparent stroke-amber-600/70 dark:stroke-amber-400/80"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved opportunities yet</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          Use the bookmark icon on any card to save it here. Saved items stay on this device.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >
          Browse all opportunities
        </button>
      </div>
    </div>
  );
}

function NoResultsEmptyState({
  onClear,
  searchQuery,
}: {
  onClear: () => void;
  searchQuery: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/80 shadow-sm px-8 py-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800/80">
          <SearchX className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No opportunities match your filters
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          {searchQuery ? (
            <>
              Nothing matched &quot;{searchQuery}&quot; with your current filters. Try different keywords or relax
              your filters.
            </>
          ) : (
            <>Nothing matched your current filters. Try turning off a filter to see more opportunities.</>
          )}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-95 shadow-sm transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >
          Clear search & filters
        </button>
      </div>
    </div>
  );
}

function PaginatedSections({
  filteredHackathons,
  filteredInternships,
  filteredOffers,
}: {
  filteredHackathons: Opportunity[];
  filteredInternships: Opportunity[];
  filteredOffers: Opportunity[];
}) {
  const [visibleHackathons, setVisibleHackathons] = useState(INITIAL_VISIBLE_COUNT);
  const [visibleInternships, setVisibleInternships] = useState(INITIAL_VISIBLE_COUNT);
  const [visibleOffers, setVisibleOffers] = useState(INITIAL_VISIBLE_COUNT);

  return (
    <>
      {/* Hackathons */}
      <section>
        <SectionHeader
          id="hackathons"
          title="Hackathons"
          subtitle="Compete, build, and win prizes"
          icon={Trophy}
          count={filteredHackathons.length}
          gradient="from-blue-500 to-cyan-500"
        />
        {filteredHackathons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHackathons.slice(0, visibleHackathons).map((item) => (
                <OpportunityCard key={item.id} opportunity={item} />
              ))}
            </div>
            {filteredHackathons.length > visibleHackathons && (
              <LoadMoreButton onClick={() => setVisibleHackathons((count) => count + LOAD_MORE_STEP)} />
            )}
          </>
        ) : (
          <EmptyState type="hackathons" />
        )}
      </section>

      <div className="border-t border-gray-200 dark:border-gray-800" />

      {/* Internships */}
      <section>
        <SectionHeader
          id="internships"
          title="Internships"
          subtitle="Launch your career with top companies"
          icon={Briefcase}
          count={filteredInternships.length}
          gradient="from-violet-500 to-blue-500"
        />
        {filteredInternships.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInternships.slice(0, visibleInternships).map((item) => (
                <OpportunityCard key={item.id} opportunity={item} />
              ))}
            </div>
            {filteredInternships.length > visibleInternships && (
              <LoadMoreButton onClick={() => setVisibleInternships((count) => count + LOAD_MORE_STEP)} />
            )}
          </>
        ) : (
          <EmptyState type="internships" />
        )}
      </section>

      <div className="border-t border-gray-200 dark:border-gray-800" />

      {/* Student Offers */}
      <section>
        <SectionHeader
          id="offers"
          title="Student Offers"
          subtitle="Free tools and perks for students"
          icon={Gift}
          count={filteredOffers.length}
          gradient="from-emerald-500 to-teal-500"
        />
        {filteredOffers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOffers.slice(0, visibleOffers).map((item) => (
                <OpportunityCard key={item.id} opportunity={item} />
              ))}
            </div>
            {filteredOffers.length > visibleOffers && (
              <LoadMoreButton onClick={() => setVisibleOffers((count) => count + LOAD_MORE_STEP)} />
            )}
          </>
        ) : (
          <EmptyState type="student offers" />
        )}
      </section>
    </>
  );
}

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
      >
        Load more
      </button>
    </div>
  );
}
