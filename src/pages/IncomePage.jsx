import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIncomeItems, selectIncomeLoading, selectTotalIncome } from '../store/selectors';
import { fetchIncomes, addIncome, editIncome, deleteIncome } from '../store/slices/incomeSlice';
import { addToast } from '../store/slices/uiSlice';
import AppLayout from '../components/AppLayout';

const SOURCES = ['Salary', 'Freelance', 'Investments', 'Business', 'Rental', 'Bonus', 'Gifts', 'Other'];

export default function IncomePage() {
  const dispatch = useDispatch();
  const incomes = useSelector(selectIncomeItems);
  const loading = useSelector(selectIncomeLoading);
  const totalIncome = useSelector(selectTotalIncome);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    source: 'Salary',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    dispatch(fetchIncomes());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      source: 'Salary',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      source: item.source || 'Salary',
      amount: item.amount,
      date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      dispatch(addToast('Please enter a valid amount', 'warning'));
      return;
    }

    try {
      if (editingItem) {
        await dispatch(editIncome({ id: editingItem._id, ...formData })).unwrap();
        dispatch(addToast('Income updated successfully', 'success'));
      } else {
        await dispatch(addIncome(formData)).unwrap();
        dispatch(addToast('Income recorded successfully', 'success'));
      }
      setIsModalOpen(false);
    } catch (err) {
      dispatch(addToast(err || 'Failed to save income', 'error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await dispatch(deleteIncome(id)).unwrap();
        dispatch(addToast('Income entry removed', 'info'));
      } catch (err) {
        dispatch(addToast(err || 'Failed to delete income', 'error'));
      }
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Income Streams
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track all incoming cash flows, salaries, bonuses, and freelance revenues
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <span>＋</span> Add Income
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Inflow
          </p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Entries
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tabular-nums">
            {incomes.length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Average Inflow
          </p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            ₹{incomes.length ? (totalIncome / incomes.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
          </p>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">All Income Records</h3>
          {loading && <span className="text-xs text-indigo-500 animate-pulse">Syncing...</span>}
        </div>

        {incomes.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-4xl block mb-2">💵</span>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No income logged yet</p>
            <p className="text-xs text-gray-400 mt-1">Start by clicking "Add Income" above to keep your balance accurate.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {incomes.map((item) => (
              <div key={item._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    💰
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {item.source}
                      </p>
                      {item.description && (
                        <span className="text-xs text-gray-400 hidden sm:inline">— {item.description}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base sm:text-lg tabular-nums">
                    +₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Income' : 'Record New Income'}
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
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly paycheck or client milestone"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  {editingItem ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
