import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectGoalItems, selectGoalsLoading } from '../store/selectors';
import {
  fetchGoals,
  addGoal,
  editGoal,
  contributeGoal,
  deleteGoal,
} from '../store/slices/goalsSlice';
import { addToast } from '../store/slices/uiSlice';
import AppLayout from '../components/AppLayout';

export default function GoalsPage() {
  const dispatch = useDispatch();
  const goals = useSelector(selectGoalItems);
  const loading = useSelector(selectGoalsLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: 0,
    deadline: '',
    category: 'General',
  });

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      targetAmount: '',
      currentAmount: 0,
      deadline: '',
      category: 'General',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingGoal(g);
    setFormData({
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount || 0,
      deadline: g.deadline ? g.deadline.split('T')[0] : '',
      category: g.category || 'General',
    });
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!formData.title || Number(formData.targetAmount) <= 0) {
      dispatch(addToast('Please provide a title and target amount', 'warning'));
      return;
    }

    try {
      if (editingGoal) {
        await dispatch(editGoal({ id: editingGoal._id, ...formData })).unwrap();
        dispatch(addToast('Goal updated successfully', 'success'));
      } else {
        await dispatch(addGoal(formData)).unwrap();
        dispatch(addToast('New savings goal created!', 'success'));
      }
      setIsModalOpen(false);
    } catch (err) {
      dispatch(addToast(err || 'Failed to save goal', 'error'));
    }
  };

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    if (!contributeAmount || Number(contributeAmount) <= 0) {
      dispatch(addToast('Enter a valid contribution amount', 'warning'));
      return;
    }

    try {
      await dispatch(
        contributeGoal({ id: contributeTarget._id, amount: Number(contributeAmount) })
      ).unwrap();
      dispatch(addToast(`Added ₹${contributeAmount} to "${contributeTarget.title}"!`, 'success'));
      setContributeTarget(null);
      setContributeAmount('');
    } catch (err) {
      dispatch(addToast(err || 'Failed to contribute', 'error'));
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete goal "${title}"?`)) {
      try {
        await dispatch(deleteGoal(id)).unwrap();
        dispatch(addToast(`Goal "${title}" deleted`, 'info'));
      } catch (err) {
        dispatch(addToast(err || 'Failed to delete goal', 'error'));
      }
    }
  };

  const totalTarget = goals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((s, g) => s + (Number(g.currentAmount) || 0), 0);
  const completedCount = goals.filter((g) => (g.currentAmount || 0) >= g.targetAmount).length;

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Savings Goals
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set targets for vacations, emergency funds, tech upgrades, and celebrate milestones
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <span>＋</span> Create Goal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Accumulated Savings
          </p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            ₹{totalSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Target Target
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tabular-nums">
            ₹{totalTarget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Goals Completed
          </p>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 tabular-nums">
            {completedCount} / {goals.length}
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <span className="text-4xl block mb-2">🎯</span>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No active goals found</p>
          <p className="text-xs text-gray-400 mt-1">Plan your future milestones and track contributions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const current = Number(g.currentAmount) || 0;
            const target = Number(g.targetAmount) || 1;
            const percentage = Math.min(Math.round((current / target) * 100), 100);
            const isFinished = current >= target;

            return (
              <div
                key={g._id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isFinished
                    ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/40 dark:border-emerald-500/30'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {g.category || 'Goal'}
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base mt-1 line-clamp-1">
                        {g.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(g)}
                        className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(g._id, g.title)}
                        className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {isFinished && (
                    <div className="mb-3 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <span>🏆</span> Goal Achieved! Congratulations!
                    </div>
                  )}

                  {/* Amount Progress */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                      <span>Saved: <strong className="text-gray-900 dark:text-white">₹{current.toLocaleString('en-IN')}</strong></span>
                      <span>Target: ₹{target.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isFinished ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{percentage}% completed</span>
                      {g.deadline && (
                        <span>Due: {new Date(g.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contribute Action */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                  <button
                    onClick={() => {
                      setContributeTarget(g);
                      setContributeAmount('');
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>💰</span> Contribute to Goal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contribute Modal */}
      {contributeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Add to "{contributeTarget.title}"
                </h3>
                <p className="text-xs text-gray-400">Target: ₹{Number(contributeTarget.targetAmount).toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => setContributeTarget(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              {/* Preset quick buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContributeAmount(String(amt))}
                    className="py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Contribution Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. 2500"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Create Savings Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Trip, MacBook Pro, Emergency Reserve"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. 50000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Current Saved (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
                  {editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
