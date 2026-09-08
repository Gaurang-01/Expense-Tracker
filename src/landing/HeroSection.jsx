import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 overflow-hidden hero-gradient">
      {/* Background glow orbs */}
      <div className="glow-orb w-96 h-96 bg-indigo-500/20 top-1/4 -left-20" />
      <div className="glow-orb w-96 h-96 bg-purple-500/20 top-1/3 -right-20" />

      <div className="max-w-5xl mx-auto w-full text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-sm shadow-indigo-500/10"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Next-Gen Expense Management
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-6"
          >
            Master Your Money with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Precision & Speed
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Gain instant clarity on your personal finances. Track spending, visualize cash flows, and reach your savings goals with a seamless, modern experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-14"
          >
            <Link
              to="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <span>Launch App</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 font-semibold text-base border border-gray-200/80 dark:border-gray-700 transition-all duration-200 text-center backdrop-blur-sm"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Interactive Floating Preview Card */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-3xl relative mx-auto"
          >
            <div className="rounded-2xl p-1 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent shadow-2xl shadow-indigo-500/10">
              <div className="rounded-[14px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800 p-6 text-left">
                {/* Mock App Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="ml-2 text-xs font-mono text-gray-400 dark:text-gray-500">Live Dashboard</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                    ● Real-time Sync
                  </div>
                </div>

                {/* Mock Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Total Spent</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">$3,420.50</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Top Category</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">🍔 Food & Dining</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Monthly Trend</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">↓ 12% Saved</span>
                  </div>
                </div>

                {/* Mock Transactions List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">🛒</div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">Grocery Supermarket</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Today, 2:15 PM</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">-$142.30</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-sm">⚡</div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">Cloud Hosting & Tools</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Yesterday, 9:00 AM</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">-$29.00</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
