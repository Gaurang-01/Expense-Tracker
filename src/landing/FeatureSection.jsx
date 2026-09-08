import { motion } from 'framer-motion';

const features = [
  {
    id: 'track',
    title: 'Instant Expense Logging',
    tagline: 'Record expenses with zero friction',
    description:
      'Log transactions in seconds with real-time validation, automatic category tagging, and date selection. Never let an expense slip through the cracks.',
    icon: '⚡',
    gradient: 'from-amber-500 to-orange-500',
    demo: (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-base">☕</span>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Morning Espresso & Pastry</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Food & Dining • Just now</p>
            </div>
          </div>
          <span className="text-xs font-bold text-red-600 dark:text-red-400">-$6.50</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-base">🚗</span>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Rideshare Downtown</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Transportation • Today</p>
            </div>
          </div>
          <span className="text-xs font-bold text-red-600 dark:text-red-400">-$24.10</span>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">✓ Instant auto-save to Redux store</span>
        </div>
      </div>
    ),
  },
  {
    id: 'analytics',
    title: 'Category Intelligence & Summaries',
    tagline: 'Understand exactly where your funds go',
    description:
      'Live category-wise breakdowns and progress distributions calculate total expenditures instantly with memoized Reselect selectors.',
    icon: '📊',
    gradient: 'from-indigo-500 to-purple-600',
    demo: (
      <div className="space-y-3.5">
        <div>
          <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span>🍔 Food & Dining (45%)</span>
            <span className="font-semibold">$540.00</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full w-[45%]" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span>🏠 Housing & Utilities (30%)</span>
            <span className="font-semibold">$360.00</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full w-[30%]" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span>🎬 Entertainment & Leisure (25%)</span>
            <span className="font-semibold">$300.00</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[25%]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'filters',
    title: 'Dynamic Filter & Search Engine',
    tagline: 'Pinpoint any transaction in milliseconds',
    description:
      'Filter seamlessly across custom date ranges, specific categories, or keywords. All selector calculations run in zero lag memory space.',
    icon: '🔍',
    gradient: 'from-cyan-500 to-blue-600',
    demo: (
      <div className="space-y-2.5">
        <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <span className="text-gray-400 text-xs">🔍</span>
          <span className="text-xs text-gray-800 dark:text-gray-200 font-mono">"Groceries"</span>
          <span className="ml-auto text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
            3 matches
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-medium">All Categories</span>
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px]">Food</span>
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px]">Utilities</span>
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px]">Travel</span>
        </div>
      </div>
    ),
  },
  {
    id: 'sync',
    title: 'Offline-First & Redux Architecture',
    tagline: 'Reliable, private, and always responsive',
    description:
      'Structured with Redux Toolkit and automatic localStorage persistence. Your financial data stays responsive and private on your device.',
    icon: '🛡️',
    gradient: 'from-emerald-500 to-teal-600',
    demo: (
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-gray-900 dark:text-white">Store Synchronized</span>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
          Immutable state management via Immer & RTK slices ensures zero data corruption and complete state rollback safety.
        </p>
      </div>
    ),
  },
];

export default function FeatureSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 relative max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/50">
          Features
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-4 mb-4">
          Everything You Need to Take Control
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Engineered for speed, built with state-of-the-art React and Redux architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
        {features.map((feat, idx) => (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-black/20 flex flex-col justify-between transition-shadow hover:shadow-2xl hover:shadow-indigo-500/10"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-xl text-white shadow-md`}
                >
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {feat.tagline}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {feat.description}
              </p>
            </div>

            <div className="rounded-xl p-4 bg-gray-50/80 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800/80">
              {feat.demo}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
