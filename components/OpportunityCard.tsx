'use client';

import Link from 'next/link';
import {
  Bookmark,
  Calendar,
  MapPin,
  Wifi,
  Sparkles,
  DollarSign,
  ExternalLink,
  Trophy,
  Briefcase,
  Gift,
} from 'lucide-react';
import type { Opportunity } from '@/lib/data';
import { useSavedIds } from '@/hooks/use-saved-ids';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const typeConfig = {
  hackathon: {
    icon: Trophy,
    gradient: 'from-blue-500 to-cyan-500',
    tagBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/60',
  },
  internship: {
    icon: Briefcase,
    gradient: 'from-violet-500 to-blue-500',
    tagBg: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300 border-violet-100 dark:border-violet-800/60',
  },
  offer: {
    icon: Gift,
    gradient: 'from-emerald-500 to-teal-500',
    tagBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60',
  },
};

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return 'Expired';
  if (diff === 0) return 'Today';
  if (diff <= 7) return `${diff}d left`;
  if (diff <= 30) return `${Math.ceil(diff / 7)}w left`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDeadlineUrgency(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 7) return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-100 dark:border-red-800/60';
  if (diff <= 21) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-800/60';
  return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { isSaved, toggleSaved } = useSavedIds();
  const saved = isSaved(opportunity.id);
  const config = typeConfig[opportunity.type];
  const deadlineLabel = formatDeadline(opportunity.deadline);
  const deadlineClass = getDeadlineUrgency(opportunity.deadline);

  return (
    <div
      className={`group relative flex flex-col bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/40 transition-all duration-300 hover:-translate-y-0.5`}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${config.gradient}`} />

      <button
        type="button"
        aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSaved(opportunity.id);
        }}
        className="absolute top-3 right-3 z-20 rounded-full p-2 border border-gray-200/90 dark:border-gray-600 bg-white/95 dark:bg-gray-800/95 shadow-sm hover:bg-amber-50/90 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
      >
        <Bookmark
          className={`h-4 w-4 transition-colors ${
            saved
              ? 'fill-amber-400 text-amber-500 stroke-amber-500 dark:fill-amber-400 dark:text-amber-300 dark:stroke-amber-300'
              : 'fill-transparent stroke-gray-500 dark:stroke-gray-400'
          }`}
          strokeWidth={2}
        />
      </button>

      <Link
        href={`/opportunity/${opportunity.id}`}
        className="flex flex-col flex-1 min-h-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40 rounded-b-2xl"
      >
        <div className="p-5 pr-14 flex flex-col flex-1 gap-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}
              >
                {opportunity.logo}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {opportunity.company}
                </p>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {opportunity.title}
                </h3>
              </div>
            </div>

            {(opportunity.prize || opportunity.salary) && (
              <div className="flex-shrink-0 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/60 rounded-lg">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {opportunity.prize ?? opportunity.salary}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
            {opportunity.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {opportunity.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-xs font-medium rounded-md border ${config.tagBg}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {opportunity.isBeginnerFriendly && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 rounded-md">
                <Sparkles size={10} />
                Beginner
              </span>
            )}
            {opportunity.isRemote && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/50 rounded-md">
                <Wifi size={10} />
                Remote
              </span>
            )}
            {opportunity.isPaid && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/50 rounded-md">
                <DollarSign size={10} />
                Paid
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium ${deadlineClass}`}>
              <Calendar size={10} />
              {deadlineLabel}
            </span>
            {opportunity.location !== 'Online' && opportunity.location !== 'Remote' && (
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {opportunity.location}
              </span>
            )}
          </div>
          <span
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r ${config.gradient} rounded-lg group-hover:opacity-90 group-hover:shadow-sm transition-all`}
          >
            View details
            <ExternalLink size={11} />
          </span>
        </div>
      </Link>
    </div>
  );
}
