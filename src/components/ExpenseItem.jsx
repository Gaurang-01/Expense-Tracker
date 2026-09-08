import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getCategoryConfig } from '../utils/categories';
import { deleteExpense, setEditingExpense } from '../store/slices/expensesSlice';
import { addToast } from '../store/slices/uiSlice';

export default function ExpenseItem({ expense }) {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const cat = getCategoryConfig(expense.category);

  function handleDelete() {
    setIsDeleting(true);
    setTimeout(() => {
      dispatch(deleteExpense(expense.id));
      dispatch(addToast(`"${expense.title}" deleted`, 'error'));
    }, 300);
  }

  function handleEdit() {
    dispatch(setEditingExpense(expense));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5 ${
        isDeleting ? 'animate-fade-out-down opacity-0' : 'animate-fade-in-up'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Category Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${cat.bg} flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-110`}
        >
          {cat.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {expense.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${cat.bg} ${cat.text}`}
                >
                  {expense.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Amount */}
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tabular-nums flex-shrink-0">
              ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 transition-opacity duration-200 ${
          showConfirm ? 'opacity-100' : 'sm:opacity-0 sm:group-hover:opacity-100'
        }`}
      >
        {showConfirm ? (
          <>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium mr-auto">
              Delete this expense?
            </span>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium transition-colors"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
