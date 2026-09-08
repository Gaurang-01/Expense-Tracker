import { useSelector } from 'react-redux';
import { selectCategorySummary, selectExpenseItems } from '../store/selectors';

export default function Summary() {
  const items = useSelector(selectExpenseItems);
  const { totals, maxTotal, grandTotal } = useSelector(selectCategorySummary);

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 sm:p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xs">
          📊
        </span>
        Category Summary
      </h2>

      <div className="space-y-3">
        {totals.map((cat) => {
          const percentage = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
          return (
            <div key={cat.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cat.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  ₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.barBg} transition-all duration-700 ease-out group-hover:opacity-80`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total line */}
      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Grand Total
        </span>
        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tabular-nums">
          ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
