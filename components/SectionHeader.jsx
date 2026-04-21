export default function SectionHeader({
  id,
  title,
  subtitle,
  icon: Icon,
  count,
  gradient,
  action,
}) {
  return (
    <div
      id={id}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 scroll-mt-24"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
        >
          <Icon className="text-white" size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-syne font-bold text-zinc-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-0.5 text-sm font-dm-sans text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 shadow-sm dark:border-white/5 dark:bg-[#111318] dark:text-zinc-400">
          {count} {count === 1 ? "result" : "results"}
        </span>
        {action}
      </div>
    </div>
  );
}
