import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  selectInvestmentItems,
  selectInvestmentSummary,
  selectInvestmentsLoading,
} from '../store/selectors';
import {
  fetchInvestments,
  addInvestment,
  editInvestment,
  deleteInvestment,
} from '../store/slices/investmentsSlice';
import { addToast } from '../store/slices/uiSlice';
import AppLayout from '../components/AppLayout';

const TYPES = ['Stock', 'Mutual Fund', 'Crypto', 'Gold', 'Real Estate', 'Fixed Deposit', 'Bond', 'Other'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#3b82f6', '#64748b'];

export default function InvestmentsPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectInvestmentItems);
  const summary = useSelector(selectInvestmentSummary);
  const loading = useSelector(selectInvestmentsLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Stock',
    investedAmount: '',
    currentValue: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchInvestments());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      type: 'Stock',
      investedAmount: '',
      currentValue: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type || 'Stock',
      investedAmount: item.investedAmount,
      currentValue: item.currentValue,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || Number(formData.investedAmount) <= 0) {
      dispatch(addToast('Please enter name and valid invested amount', 'warning'));
      return;
    }

    try {
      const payload = {
        ...formData,
        investedAmount: Number(formData.investedAmount),
        currentValue: Number(formData.currentValue || formData.investedAmount),
      };

      if (editingItem) {
        await dispatch(editInvestment({ id: editingItem._id, ...payload })).unwrap();
        dispatch(addToast('Investment holding updated', 'success'));
      } else {
        await dispatch(addInvestment(payload)).unwrap();
        dispatch(addToast('Investment asset added to portfolio!', 'success'));
      }
      setIsModalOpen(false);
    } catch (err) {
      dispatch(addToast(err || 'Failed to save investment', 'error'));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}" from investments?`)) {
      try {
        await dispatch(deleteInvestment(id)).unwrap();
        dispatch(addToast(`"${name}" removed`, 'info'));
      } catch (err) {
        dispatch(addToast(err || 'Failed to delete holding', 'error'));
      }
    }
  };

  // Pie chart data
  const chartData = (summary.allocation || []).map((a) => ({
    name: a.type,
    value: a.currentValue || a.totalInvested || 0,
  })).filter((d) => d.value > 0);

  const isGain = (summary.totalGainLoss || 0) >= 0;

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Investment Portfolio
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track stocks, mutual funds, crypto, and asset allocation with live profit/loss metrics
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <span>＋</span> Add Investment
        </button>
      </div>

      {/* Portfolio Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Capital Invested
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 tabular-nums">
            ₹{Number(summary.totalInvested || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Current Valuation
          </p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            ₹{Number(summary.totalCurrent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Net Gain/Loss
          </p>
          <p className={`text-2xl font-black mt-1 tabular-nums ${isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isGain ? '+' : ''}₹{Number(summary.totalGainLoss || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Portfolio ROI
          </p>
          <p className={`text-2xl font-black mt-1 tabular-nums ${isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isGain ? '▲ +' : '▼ '}{Number(summary.percentageGainLoss || 0).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Asset Allocation Chart & Breakdown */}
      {chartData.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">
            Asset Class Allocation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {(summary.allocation || []).map((alloc, idx) => (
                <div key={alloc.type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{alloc.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 dark:text-white">
                      ₹{Number(alloc.currentValue).toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-400 ml-2">({alloc.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Current Holdings</h3>
          {loading && <span className="text-xs text-indigo-500 animate-pulse">Syncing portfolio...</span>}
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <span className="text-4xl block mb-2">📈</span>
            <p className="font-semibold text-gray-700 dark:text-gray-300">No assets in portfolio</p>
            <p className="text-xs text-gray-400 mt-1">Add your stocks, index funds, or precious metals.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30">
                  <th className="px-6 py-3.5">Asset</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Invested</th>
                  <th className="px-6 py-3.5 text-right">Current Value</th>
                  <th className="px-6 py-3.5 text-right">P/L (₹)</th>
                  <th className="px-6 py-3.5 text-right">P/L (%)</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
                {items.map((item) => {
                  const invested = Number(item.investedAmount) || 0;
                  const current = Number(item.currentValue) || invested;
                  const gain = current - invested;
                  const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
                  const positive = gain >= 0;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {item.name}
                        {item.notes && <p className="text-[10px] text-gray-400 font-normal">{item.notes}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                        ₹{invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-bold text-gray-900 dark:text-white">
                        ₹{current.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 text-right tabular-nums font-bold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {positive ? '+' : ''}₹{gain.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 text-right tabular-nums font-bold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {positive ? '+' : ''}{gainPct.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Edit holding"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Investment' : 'Add Investment Asset'}
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
                  Asset Name / Ticker
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIFTY 50 Index, Apple (AAPL), Bitcoin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Asset Class
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Invested Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 25000"
                    value={formData.investedAmount}
                    onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Current Valuation (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Defaults to invested"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purchased via Zerodha, holding long term"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {editingItem ? 'Save Changes' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
