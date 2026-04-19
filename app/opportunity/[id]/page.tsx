import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  ExternalLink,
  Gift,
  MapPin,
  Sparkles,
  Trophy,
  Wifi,
} from 'lucide-react';

import { getApplyUrl, getOpportunityById, opportunities } from '@/lib/data';

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return opportunities.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const o = getOpportunityById(id);
  if (!o) {
    return { title: 'Opportunity not found — StudentHub' };
  }
  return {
    title: `${o.title} — StudentHub`,
    description: o.description.slice(0, 160),
  };
}

const typeStyles = {
  hackathon: {
    label: 'Hackathon',
    icon: Trophy,
    gradient: 'from-blue-500 to-cyan-500',
    tagBg:
      'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/60',
  },
  internship: {
    label: 'Internship',
    icon: Briefcase,
    gradient: 'from-violet-500 to-blue-500',
    tagBg:
      'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300 border-violet-100 dark:border-violet-800/60',
  },
  offer: {
    label: 'Student offer',
    icon: Gift,
    gradient: 'from-emerald-500 to-teal-500',
    tagBg:
      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60',
  },
};

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const opportunity = getOpportunityById(id);
  if (!opportunity) {
    notFound();
  }

  const styles = typeStyles[opportunity.type];
  const TypeIcon = styles.icon;
  const applyUrl = getApplyUrl(opportunity);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back to opportunities
        </Link>

        <article className="bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-2xl shadow-sm overflow-hidden">
          <div className={`h-1.5 w-full bg-gradient-to-r ${styles.gradient}`} />

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}
              >
                {opportunity.logo}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.tagBg}`}
                  >
                    <TypeIcon size={12} />
                    {styles.label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{opportunity.company}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {opportunity.title}
                </h1>
              </div>
            </div>

            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border ${styles.tagBg}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-900/40 p-4">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Deadline
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {formatFullDate(opportunity.deadline)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-900/40 p-4">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Location
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {opportunity.location}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              {opportunity.isBeginnerFriendly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 rounded-md">
                  <Sparkles size={12} />
                  Beginner friendly
                </span>
              )}
              {opportunity.isRemote && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/50 rounded-md">
                  <Wifi size={12} />
                  Remote
                </span>
              )}
              {opportunity.isPaid && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/50 rounded-md">
                  <DollarSign size={12} />
                  Paid
                </span>
              )}
              {opportunity.prize && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/60 rounded-md">
                  Prize: {opportunity.prize}
                </span>
              )}
              {opportunity.salary && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/60 rounded-md">
                  {opportunity.salary}
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Apply</p>
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r ${styles.gradient} rounded-xl hover:opacity-95 shadow-sm transition-opacity`}
              >
                Open apply link
                <ExternalLink size={16} />
              </a>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 break-all">{applyUrl}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
