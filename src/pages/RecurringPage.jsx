import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectRecurringItems, selectRecurringLoading } from '../store/selectors';
import {
  fetchRecurring,
  addRecurring,
  editRecurring,
  deleteRecurring,
} from '../store/slices/recurringSlice';
import { addToast } from '../store/slices/uiSlice';
import { CATEGORIES } from '../utils/categories';
import AppLayout from '../components/AppLayout';

export default function RecurringPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectRecurringItems);
  const loading = useSelector(selectRecurringLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Bills',
    frequency: 'monthly',
    nextDue: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    dispatch(fetchRecurring());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      amount: '',
      category: 'Bills',
      frequency: 'monthly',
      nextDue: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      amount: item.amount,
      category: item.category || 'Bills',
      frequency: item.frequency || 'monthly',
      nextDue: item.nextDue ? item.nextDue.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || Number(formData.amount) <= 0) {
      dispatch(addToast('Please provide valid title and amount', 'warning'));
      return;
    }

    try {
      if (editingItem) {
        await dispatch(editRecurring({ id: editingItem._id, ...formData })).unwrap();
        dispatch(addToast('Recurring rule updated', 'success'));
      } else {
        await dispatch(addRecurring(formData)).unwrap();
        dispatch(addToast('Recurring subscription scheduled!', 'success'));
      }
      setIsModalOpen(false);
    } catch (err) {
      dispatch(addToast(err || 'Failed to save recurring item', 'error'));
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await dispatch(
        editRecurring({
          id: item._id,
          isActive: !item.isActive,
        })
      ).unwrap();
      dispatch(
        addToast(
          item.isActive ? `Paused "${item.title}"` : `Resumed "${item.title}"`,
          'info'
        )
      );
    } catch (err) {
      dispatch(addToast(err || 'Failed to toggle status', 'error'));
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete recurring rule for "${title}"?`)) {
      try {
        await dispatch(deleteRecurring(id)).unwrap();
        dispatch(addToast(`Rule for "${title}" deleted`, 'info'));
      } catch (err) {
        dispatch(addToast(err || 'Failed to delete rule', 'error'));
      }
    }
  };

  const totalMonthlyCommitment = items
    .filter((i) => i.isActive !== false)
    .reduce((sum, i) => {
      const amt = Number(i.amount) || 0;
      return sum + (i.frequency === 'weekly' ? amt * 4.33 : amt);
    }, 0);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Recurring Expenses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automate rent, subscriptions, and utility bills with automatic ledger recording
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <span>＋</span> Add Recurring Rule
        </button>
      </div>

      {/* Info Notice & Aggregate Cards */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 flex items-start sm:items-center gap-3">
        <span className="text-2xl flex-shrink-0">⚙️</span>
        <div className="text-xs text-indigo-950 dark:text-indigo-200">
          <strong className="font-bold">Automated Daily Cron Processing:</strong> A backend daemon runs every night at 00:05 to automatically create expenses on the due date, advance the next cycle, and push a live notification.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Monthly Recurring Commitment
          </p>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            ₹{totalMonthlyCommitment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Active Subscriptions
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tabular-nums">
            {items.filter((i) => i.isActive !== false).length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Rules
          </p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {items.length}
          </p>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">All Scheduled Items</h3>
          {loading && <span className="text-xs text-indigo-500 animate-pulse">Syncing...</span>}
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <span className="text-4xl block mb-2">🔄</span>
            <p className="font-semibold text-gray-700 dark:text-gray-300">No recurring rules configured</p>
            <p className="text-xs text-gray-400 mt-1">Add monthly rent, Netflix, gym fees, or SIPs.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((i) => {
              const catObj = CATEGORIES.find((c) => c.name === i.category) || { icon: '📦' };
              const isPaused = i.isActive === false;

              return (
                <div key={i._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                      {catObj.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-bold text-sm sm:text-base ${isPaused ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {i.title}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize">
                          {i.frequency}
                        </span>
                        {isPaused && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Next charge due: {new Date(i.nextDue).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm sm:text-base tabular-nums">
                      ₹{Number(i.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleActive(i)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isPaused
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 hover:bg-amber-100'
                        }`}
                        title={isPaused ? 'Resume auto-run' : 'Pause auto-run'}
                      >
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        onClick={() => openEditModal(i)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(i._id, i.title)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Recurring Rule' : 'New Recurring Expense'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Subscription, House Rent"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 649"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.nextDue}
                  onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  {editingItem ? 'Save Changes' : 'Schedule Recurring'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
