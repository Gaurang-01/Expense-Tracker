import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectExpensesLoading, selectExpensesError } from '../store/selectors';
import { fetchExpenses } from '../store/slices/expensesSlice';
import AppLayout from '../components/AppLayout';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Summary from '../components/Summary';
import Filters from '../components/Filters';

export default function ExpensesPage() {
  const dispatch = useDispatch();
  const loading = useSelector(selectExpensesLoading);
  const error = useSelector(selectExpensesError);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Expense Tracker
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Log, categorize, and inspect your daily spending habits
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-rose-700 dark:text-rose-300 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(fetchExpenses())}
            className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-xs font-semibold hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Expense Form */}
      <ExpenseForm />

      {/* Grid: Filters + List + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Filters />
          {loading && (
            <div className="py-8 flex justify-center items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Loading your expenses...</span>
            </div>
          )}
          <ExpenseList />
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-36">
            <Summary />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
