export default function SectionHeader({
  id,
  title,
  subtitle,
  icon: Icon,
  count,
  gradient,
}) {
  return (
    <div
      id={id}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 scroll-mt-24"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
        >
          <Icon className="text-white" size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <span className="self-start sm:self-auto text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700">
        {count} {count === 1 ? "result" : "results"}
      </span>
    </div>
  );
}
