import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  count: number;
  gradient: string;
  action?: React.ReactNode;
}

export default function SectionHeader({ id, title, subtitle, icon: Icon, count, gradient, action }: SectionHeaderProps) {
  return (
    <div id={id} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 scroll-mt-24">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
          <Icon className="text-white" size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-syne font-bold text-white">{title}</h2>
          <p className="text-sm font-dm-sans text-zinc-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <span className="text-xs font-semibold px-3 py-1 bg-[#111318] text-zinc-400 rounded-full border border-white/5 shadow-sm">
          {count} {count === 1 ? 'result' : 'results'}
        </span>
        {action}
      </div>
    </div>
  );
}
