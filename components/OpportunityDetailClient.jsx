"use client";

import Link from "next/link";
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
} from "lucide-react";
import { motion } from "framer-motion";

import { getApplyUrl } from "@/lib/data";

const typeStyles = {
  hackathon: {
    label: "Hackathon",
    icon: Trophy,
    gradient: "from-blue-500 to-cyan-500",
    tagBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  internship: {
    label: "Internship",
    icon: Briefcase,
    gradient: "from-violet-500 to-blue-500",
    tagBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  offer: {
    label: "Student offer",
    icon: Gift,
    gradient: "from-emerald-500 to-teal-500",
    tagBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  student_offer: {
    label: "Student offer",
    icon: Gift,
    gradient: "from-emerald-500 to-teal-500",
    tagBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

function formatFullDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function OpportunityDetailClient({ opportunity }) {
  const styles = typeStyles[opportunity.type];
  const TypeIcon = styles.icon;
  const applyUrl = getApplyUrl(opportunity);

  return (
    <div className="min-h-screen bg-[#09090b] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative">
        <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-indigo-400 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back to opportunities
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#111318] border border-white/10 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div
                className={`w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0 card-glow`}
              >
                {opportunity.logo}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles.tagBg}`}
                  >
                    <TypeIcon size={12} />
                    {styles.label}
                  </span>
                  <span className="text-sm font-dm-sans text-zinc-400">
                    {opportunity.company}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-syne font-bold text-white tracking-tight">
                  {opportunity.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.isArray(opportunity.tags) &&
                opportunity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-md border border-white/5 bg-zinc-800/50 text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-base font-dm-sans text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 pt-4">
              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-5">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <dt className="text-xs font-syne font-semibold text-zinc-500 uppercase tracking-wide">
                    Deadline
                  </dt>
                  <dd className="text-sm font-dm-sans text-zinc-200 mt-1">
                    {formatFullDate(opportunity.deadline)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-5">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <dt className="text-xs font-syne font-semibold text-zinc-500 uppercase tracking-wide">
                    Location
                  </dt>
                  <dd className="text-sm font-dm-sans text-zinc-200 mt-1">
                    {opportunity.location}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 pt-2">
              {opportunity.isBeginnerFriendly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                  <Sparkles size={14} />
                  Beginner friendly
                </span>
              )}
              {opportunity.isRemote && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <Wifi size={14} />
                  Remote
                </span>
              )}
              {opportunity.isPaid && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <DollarSign size={14} />
                  Paid
                </span>
              )}
              {opportunity.prize && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                  Prize: {opportunity.prize}
                </span>
              )}
              {opportunity.salary && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                  {opportunity.salary}
                </span>
              )}
            </div>

            <div className="pt-8 border-t border-white/5">
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all"
              >
                Apply for this opportunity
                <ExternalLink
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>
              <p className="mt-3 text-xs font-dm-sans text-zinc-500 break-all max-w-xl">
                {applyUrl}
              </p>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
