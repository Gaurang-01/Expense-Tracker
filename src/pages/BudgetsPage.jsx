import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectBudgetItems, selectBudgetsLoading } from '../store/selectors';
import { fetchBudgets, upsertBudget, deleteBudget } from '../store/slices/budgetsSlice';
import { addToast } from '../store/slices/uiSlice';
import { CATEGORIES } from '../utils/categories';
import AppLayout from '../components/AppLayout';

export default function BudgetsPage() {
  const dispatch = useDispatch();
  const budgets = useSelector(selectBudgetItems);
  const loading = useSelector(selectBudgetsLoading);

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]?.name || 'Food');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limitAmount || Number(limitAmount) <= 0) {
      dispatch(addToast('Please enter a valid monthly limit', 'warning'));
      return;
    }

    try {
      await dispatch(
        upsertBudget({
          category: selectedCategory,
          limit: Number(limitAmount),
        })
      ).unwrap();
      dispatch(addToast(`Monthly budget for ${selectedCategory} updated!`, 'success'));
      setLimitAmount('');
      setEditingBudget(null);
    } catch (err) {
      dispatch(addToast(err || 'Failed to update budget', 'error'));
    }
  };

  const handleEdit = (b) => {
    setEditingBudget(b);
    setSelectedCategory(b.category);
    setLimitAmount(b.limit);
  };

  const handleDelete = async (id, cat) => {
    if (window.confirm(`Remove monthly budget for ${cat}?`)) {
      try {
        await dispatch(deleteBudget(id)).unwrap();
        dispatch(addToast(`Budget for ${cat} removed`, 'info'));
      } catch (err) {
        dispatch(addToast(err || 'Failed to delete budget', 'error'));
      }
    }
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-rose-600 dark:text-rose-400 bg-rose-500';
    if (percentage >= 70) return 'text-amber-500 dark:text-amber-400 bg-amber-500';
    return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500';
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set spending guardrails per category and receive automated threshold alerts
          </p>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Monthly Limit
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tabular-nums">
            ₹{totalBudgeted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Spent this Month
          </p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Overall Utilization
          </p>
          <p className={`text-2xl sm:text-3xl font-black mt-1 tabular-nums ${overallPercentage >= 100 ? 'text-rose-600' : overallPercentage >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
            {overallPercentage}%
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          {editingBudget ? `Edit Limit for ${selectedCategory}` : 'Set or Update Category Limit'}
        </h3>
        <form onSubmit={handleSaveBudget} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-1/3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <input
              type="number"
              step="1"
              required
              placeholder="Monthly Limit (₹)"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-auto flex gap-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Save Budget
            </button>
            {editingBudget && (
              <button
                type="button"
                onClick={() => {
                  setEditingBudget(null);
                  setLimitAmount('');
                }}
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category Progress Bars */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Active Category Budgets</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &lt;70% Safe</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 70-99% Alert</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 100%+ Exceeded</span>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <span className="text-3xl block mb-2">🎯</span>
            <p className="font-semibold text-gray-700 dark:text-gray-300">No category limits set yet</p>
            <p className="text-xs text-gray-400 mt-1">Configure your monthly allowance per category above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {budgets.map((b) => {
              const catObj = CATEGORIES.find((c) => c.name === b.category) || { icon: '🏷️' };
              const pct = b.percentage || 0;
              const barColor = pct >= 100 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <div
                  key={b._id}
                  className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{catObj.icon}</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{b.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(b)}
                        className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"
                        title="Edit limit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(b._id, b.category)}
                        className="text-xs text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                        title="Remove budget"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5 tabular-nums">
                    <span>
                      Spent: <strong className="text-gray-900 dark:text-white">₹{Number(b.spent).toLocaleString('en-IN')}</strong> of ₹{Number(b.limit).toLocaleString('en-IN')}
                    </span>
                    <span className={`font-bold ${pct >= 100 ? 'text-rose-600' : pct >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar track */}
                  <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  {b.remaining !== undefined && (
                    <p className="text-[11px] text-gray-400 mt-2">
                      {b.remaining >= 0 ? (
                        <span>Remaining: ₹{Number(b.remaining).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-rose-500 font-semibold">Over budget by ₹{Math.abs(Number(b.remaining)).toLocaleString('en-IN')}</span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
