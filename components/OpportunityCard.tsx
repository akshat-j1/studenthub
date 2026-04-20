'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bookmark,
  Calendar,
  MapPin,
  Wifi,
  Sparkles,
  DollarSign,
  ArrowRight,
  Trophy,
  Briefcase,
  Gift,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Opportunity } from '@/lib/data';
import { useSavedIds } from '@/hooks/use-saved-ids';

interface OpportunityCardProps {
  opportunity: Opportunity;
  hasVoted?: boolean;
  votes?: number;
  onVote?: (id: string) => void;
}

const typeConfig = {
  hackathon: {
    icon: Trophy,
    label: 'Hackathon',
  },
  internship: {
    icon: Briefcase,
    label: 'Internship',
  },
  offer: {
    icon: Gift,
    label: 'Offer',
  },
  student_offer: {
    icon: Gift,
    label: 'Offer',
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

function getDeadlineUrgency(dateStr: string): { class: string; urgent: boolean } {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 3) return { class: 'text-red-400 bg-red-500/10 border-red-500/20', urgent: true };
  if (diff <= 7) return { class: 'text-amber-400 bg-amber-500/10 border-amber-500/20', urgent: true };
  return { class: 'text-zinc-400 bg-white/5 border-white/10', urgent: false };
}

export default function OpportunityCard({ opportunity, hasVoted, votes, onVote }: OpportunityCardProps) {
  const { isSaved, toggleSaved } = useSavedIds();
  const saved = isSaved(opportunity.id);
  const config = typeConfig[opportunity.type];
  const deadlineLabel = formatDeadline(opportunity.deadline);
  const deadlineUrgency = getDeadlineUrgency(opportunity.deadline);
  const [isHovered, setIsHovered] = useState(false);
  const displayVotes = votes ?? opportunity.votes ?? 0;

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(99,102,241,0.15)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#111318] border border-white/10 rounded-2xl overflow-hidden p-5 gap-4"
    >
      <Link href={`/opportunity/${opportunity.id}`} className="absolute inset-0 z-0" aria-label={`View ${opportunity.title}`} />
      
      {/* Top Row: Logo, Badge, Bookmark */}
      <div className="flex items-start justify-between relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-bold shadow-sm flex-shrink-0">
            {opportunity.logo}
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
            <config.icon size={12} />
            {config.label}
          </span>
        </div>
        
        <motion.button
          type="button"
          aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
          aria-pressed={saved}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void toggleSaved(opportunity.id);
          }}
          className="pointer-events-auto rounded-full p-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus:outline-none"
        >
          <Bookmark
            className={`h-4 w-4 transition-colors ${
              saved
                ? 'fill-indigo-500 text-indigo-500 stroke-indigo-500'
                : 'fill-transparent stroke-zinc-400'
            }`}
            strokeWidth={2}
          />
        </motion.button>
      </div>

      {/* Title & Company */}
      <div className="relative z-10 pointer-events-none mt-1">
        <h3 className="font-syne text-lg font-semibold text-[#f4f4f5] leading-snug line-clamp-2">
          {opportunity.title}
        </h3>
        <p className="font-dm-sans text-sm text-[#71717a] mt-1 truncate">
          {opportunity.company}
        </p>
      </div>

      {/* Tags Row */}
      <div className="relative z-10 pointer-events-none flex flex-wrap gap-2 mt-1">
        {Array.isArray(opportunity.tags) && opportunity.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs font-medium rounded-md bg-zinc-800/50 text-zinc-300 border border-white/5"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Metadata Row */}
      <div className="relative z-10 pointer-events-none flex items-center gap-3 text-xs text-zinc-400 mt-2">
        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md border font-medium ${deadlineUrgency.class}`}>
          {deadlineUrgency.urgent && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          )}
          <Calendar size={12} className={!deadlineUrgency.urgent ? 'opacity-70' : ''} />
          {deadlineLabel}
        </span>
        {opportunity.location !== 'Online' && opportunity.location !== 'Remote' && (
          <span className="flex items-center gap-1">
            <MapPin size={12} className="opacity-70" />
            {opportunity.location}
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Row: Feature Badges & CTA */}
      <div className="relative z-10 pointer-events-none flex items-center justify-between mt-2 pt-4 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {opportunity.isBeginnerFriendly && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <Sparkles size={10} />
              Beginner
            </span>
          )}
          {opportunity.isRemote && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <Wifi size={10} />
              Remote
            </span>
          )}
          {opportunity.isPaid && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <DollarSign size={10} />
              Paid
            </span>
          )}
          
          {/* Upvote Button for Student Offers */}
          {onVote && (opportunity.type === 'student_offer' || opportunity.type === 'offer') && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onVote(opportunity.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors pointer-events-auto ${
                hasVoted 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' 
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
            >
              👍 {displayVotes} {hasVoted ? 'Voted' : ''}
            </button>
          )}
        </div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-indigo-400 flex-shrink-0 ml-2"
            >
              <ArrowRight size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team Link Button */}
      {opportunity.type === 'hackathon' && opportunity.team_link && (
        <div className="relative z-20 mt-2 pointer-events-auto">
          <a
            href={opportunity.team_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-full gap-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition-colors"
          >
            Join Team Chat
          </a>
        </div>
      )}
    </motion.div>
  );
}
