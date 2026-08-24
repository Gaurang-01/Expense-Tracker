export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in-up">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-indigo-400 dark:text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-1/2 -right-5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        No expenses yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs text-sm leading-relaxed">
        Start tracking your spending by adding your first expense using the form above.
      </p>

      {/* Animated arrow pointing up */}
      <div className="mt-6 animate-bounce">
        <svg
          className="w-6 h-6 text-indigo-400 rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
