import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-indigo-500/30 overflow-hidden text-center"
        >
          {/* Decorative background grid / circles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-5">
              Start Today
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Ready to take charge of your spending?
            </h2>

            <p className="text-base sm:text-lg text-indigo-100 mb-8 leading-relaxed">
              No sign-up forms, no subscription fees. Open the tracker right now and experience total financial control in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/app"
                className="w-full sm:w-auto px-9 py-4 rounded-xl bg-white text-indigo-700 font-bold text-base shadow-xl hover:bg-indigo-50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Launch Expense Tracker</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Micro proof perks */}
            <div className="grid grid-cols-3 gap-4 pt-10 mt-10 border-t border-white/20 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold">100%</div>
                <div className="text-xs text-indigo-100">Free & Open</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold">0ms</div>
                <div className="text-xs text-indigo-100">Sync Latency</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold">Private</div>
                <div className="text-xs text-indigo-100">Local Storage</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} ExpenseTracker. Built with React, Redux Toolkit & Tailwind CSS.</p>
        </footer>
      </div>
    </section>
  );
}
