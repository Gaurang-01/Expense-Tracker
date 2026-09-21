import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../store/selectors';
import { getCategoryConfig, CATEGORIES } from '../utils/categories';
import api from '../utils/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// ── Chart color palette (matching category system) ──────────────────────
const CHART_COLORS = {
  Food: '#10b981',
  Travel: '#0ea5e9',
  Shopping: '#8b5cf6',
  Bills: '#f59e0b',
  Entertainment: '#f43f5e',
  Other: '#64748b',
};

const DONUT_COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#64748b'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Custom Recharts Tooltip ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '₹', darkMode }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-xl border shadow-lg text-xs ${
      darkMode
        ? 'bg-gray-800 border-gray-700 text-gray-200'
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} style={{ color: item.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
          {item.name}: {prefix}{Number(item.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

// ── Skeleton Components ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 sm:p-6 animate-pulse">
      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="h-56 bg-gray-100 dark:bg-gray-700/30 rounded-xl" />
    </div>
  );
}

// ── Summary Card Component ──────────────────────────────────────────────
function SummaryCard({ icon, iconBg, label, value, subtitle, delay = 0 }) {
  return (
    <div
      className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-lg flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Chart Wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, icon, children, delay = 0, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 sm:p-6 shadow-sm animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Custom Pie Label ────────────────────────────────────────────────────
function renderCustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Skip very small slices

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-[11px] fill-gray-600 dark:fill-gray-400 font-medium"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════
export default function AnalyticsDashboard() {
  const darkMode = useSelector(selectDarkMode);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/expenses/analytics');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Computed: Natural Language Summary ───────────────────────────────
  const nlSummary = (() => {
    if (!data?.monthComparison?.length || !data?.topCategory) return null;

    const top = data.topCategory;
    const comparison = data.monthComparison.find((c) => c.category === top.category);
    if (!comparison) return null;

    const direction = comparison.pctChange >= 0 ? 'more' : 'less';
    const absPct = Math.abs(comparison.pctChange);

    if (comparison.lastMonth === 0) {
      return `You spent ₹${top.total.toLocaleString('en-IN')} on ${top.category} this month — it's a new category this month!`;
    }

    return `You spent ₹${top.total.toLocaleString('en-IN')} on ${top.category} this month, ${absPct}% ${direction} than last month.`;
  })();

  // ── Computed: Monthly Trend chart data ──────────────────────────────
  const trendData = data?.monthlyTrend?.map((m) => ({
    name: `${MONTH_NAMES[m.month - 1]} '${String(m.year).slice(2)}`,
    total: m.total,
    count: m.count,
  })) || [];

  // ── Computed: Category Breakdown for donut ─────────────────────────
  const donutData = data?.categoryBreakdown?.map((c) => ({
    name: c.category,
    value: c.total,
  })) || [];

  // ── Computed: Month Comparison for grouped bar ─────────────────────
  const comparisonData = data?.monthComparison?.map((c) => ({
    category: c.category,
    'This Month': c.thisMonth,
    'Last Month': c.lastMonth,
    pctChange: c.pctChange,
  })) || [];

  // ── Computed: Day-of-Week data ─────────────────────────────────────
  const dowData = data?.dayOfWeekPattern || [];

  // ── Computed: Total expenses count check ───────────────────────────
  const totalExpensesCount = data?.categoryBreakdown?.reduce((s, c) => s + c.count, 0) || 0;

  // ── Axis/Grid color based on dark mode ─────────────────────────────
  const axisColor = darkMode ? '#4b5563' : '#e5e7eb';
  const textColor = darkMode ? '#9ca3af' : '#6b7280';

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Header area */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Loading insights…</p>
              </div>
            </div>
            <Link
              to="/app"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              ← Expenses
            </Link>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => <SkeletonChart key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Failed to Load Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={fetchAnalytics}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
            >
              Retry
            </button>
            <Link
              to="/app"
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Expenses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty state (fewer than 2 expenses)
  if (totalExpensesCount < 2) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-8 max-w-md w-full text-center shadow-sm animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-3xl mx-auto mb-5">
            📊
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Not Enough Data Yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Analytics need at least 2 expenses to generate meaningful insights.
            Start tracking your spending and come back!
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            <span>➕</span> Add Expenses
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ── Dashboard Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Analytics Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {MONTH_NAMES[data.meta.currentMonth - 1]} {data.meta.currentYear} · Day {data.meta.dayOfMonth} of {data.meta.daysInMonth}
              </p>
            </div>
          </div>

          <Link
            to="/app"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back to Expenses</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ── Unusual Expenses Alert Banner ────────────────────────────── */}
        {data.unusualExpenses?.length > 0 && !alertDismissed && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 animate-fade-in-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  ⚠️
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    Unusual Spending Detected
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                    {data.unusualExpenses.length} expense{data.unusualExpenses.length > 1 ? 's' : ''} flagged as significantly above category average:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.unusualExpenses.map((exp) => (
                      <span
                        key={exp._id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40"
                      >
                        <span>{getCategoryConfig(exp.category).emoji}</span>
                        {exp.title}
                        <span className="font-semibold">₹{exp.amount.toLocaleString('en-IN')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAlertDismissed(true)}
                className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-500 dark:text-amber-400 transition-colors flex-shrink-0"
                aria-label="Dismiss alert"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Natural Language Summary ─────────────────────────────────── */}
        {nlSummary && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl px-5 py-4 animate-fade-in-up">
            <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium flex items-center gap-2">
              <span className="text-base">💡</span>
              {nlSummary}
            </p>
          </div>
        )}

        {/* ── Summary Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon="🏆"
            iconBg="bg-emerald-100 dark:bg-emerald-900/50"
            label="Top Category"
            value={data.topCategory ? `${getCategoryConfig(data.topCategory.category).emoji} ${data.topCategory.category}` : '—'}
            subtitle={data.topCategory ? `₹${data.topCategory.total.toLocaleString('en-IN')} this month` : null}
            delay={0}
          />
          <SummaryCard
            icon="🎯"
            iconBg="bg-indigo-100 dark:bg-indigo-900/50"
            label="Projected Month-End"
            value={`₹${data.projectedTotal.toLocaleString('en-IN')}`}
            subtitle={`Current: ₹${data.thisMonthTotal.toLocaleString('en-IN')}`}
            delay={50}
          />
          <SummaryCard
            icon="📅"
            iconBg="bg-sky-100 dark:bg-sky-900/50"
            label="Daily Average"
            value={`₹${data.dailyAverage.toLocaleString('en-IN')}`}
            subtitle={`Day ${data.meta.dayOfMonth} of ${data.meta.daysInMonth}`}
            delay={100}
          />
          <SummaryCard
            icon={data.unusualExpenses?.length > 0 ? '🚨' : '✅'}
            iconBg={data.unusualExpenses?.length > 0
              ? 'bg-amber-100 dark:bg-amber-900/50'
              : 'bg-green-100 dark:bg-green-900/50'
            }
            label="Unusual Expenses"
            value={data.unusualExpenses?.length > 0 ? `${data.unusualExpenses.length} flagged` : 'None detected'}
            subtitle={data.unusualExpenses?.length > 0 ? 'Above 2× category avg' : 'Spending looks normal'}
            delay={150}
          />
        </div>

        {/* ── Spending Progress ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 sm:p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-base">📈</span>
              Month Progress
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round((data.meta.dayOfMonth / data.meta.daysInMonth) * 100)}% of month elapsed
            </span>
          </div>

          {/* Time progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Day 1</span>
              <span>Day {data.meta.daysInMonth}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${(data.meta.dayOfMonth / data.meta.daysInMonth) * 100}%` }}
              />
            </div>
          </div>

          {/* Spending progress */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>
              Spent: <span className="font-semibold text-gray-900 dark:text-white">₹{data.thisMonthTotal.toLocaleString('en-IN')}</span>
            </span>
            <span>
              Projected: <span className="font-semibold text-indigo-600 dark:text-indigo-400">₹{data.projectedTotal.toLocaleString('en-IN')}</span>
            </span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${data.projectedTotal > 0 ? Math.min((data.thisMonthTotal / data.projectedTotal) * 100, 100) : 0}%` }}
            />
            {/* Projected marker line */}
            <div
              className="absolute top-0 h-full w-0.5 bg-indigo-500 dark:bg-indigo-400"
              style={{ left: '100%', transform: 'translateX(-2px)' }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            At ₹{data.dailyAverage.toLocaleString('en-IN')}/day, you&apos;re on track to spend ₹{data.projectedTotal.toLocaleString('en-IN')} by month end.
          </p>
        </div>

        {/* ── Charts Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Monthly Trend Line Chart ──────────────────────────────── */}
          <ChartCard title="Monthly Spending Trend" icon="📉" delay={250}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={axisColor} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 5, stroke: darkMode ? '#1f2937' : '#fff' }}
                    activeDot={{ r: 7, fill: '#6366f1', stroke: darkMode ? '#1f2937' : '#fff', strokeWidth: 3 }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* ── Category Breakdown Donut Chart ────────────────────────── */}
          <ChartCard title="Category Breakdown" icon="🍩" delay={300}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderCustomPieLabel}
                    labelLine={false}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[entry.name] || DONUT_COLORS[index % DONUT_COLORS.length]}
                        stroke={darkMode ? '#1f2937' : '#fff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {donutData.map((entry) => (
                <span key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[entry.name] || '#64748b' }}
                  />
                  {entry.name}
                </span>
              ))}
            </div>
          </ChartCard>

          {/* ── Month-over-Month Comparison Bar Chart ─────────────────── */}
          <ChartCard title="This Month vs Last Month" icon="📊" delay={350}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={axisColor} />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: textColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="This Month" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Last Month" fill={darkMode ? '#4b5563' : '#d1d5db'} radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Change badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {comparisonData.map((item) => (
                <span
                  key={item.category}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                    item.pctChange > 0
                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
                      : item.pctChange < 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/40'
                  }`}
                >
                  {getCategoryConfig(item.category).emoji} {item.category}
                  <span>{item.pctChange > 0 ? '↑' : item.pctChange < 0 ? '↓' : '='}{Math.abs(item.pctChange)}%</span>
                </span>
              ))}
            </div>
          </ChartCard>

          {/* ── Day of Week Pattern Bar Chart ─────────────────────────── */}
          <ChartCard title="Spending by Day of Week" icon="📅" delay={400}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dowData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={axisColor} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                  <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {dowData.map((entry) => {
                      const isWeekend = entry.day === 'Sat' || entry.day === 'Sun';
                      return (
                        <Cell
                          key={entry.day}
                          fill={isWeekend ? '#f59e0b' : '#6366f1'}
                          opacity={0.85}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Weekday
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Weekend
              </span>
            </div>
          </ChartCard>
        </div>

        {/* ── Category Detail Table ───────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 sm:p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-base">📋</span>
            Category Comparison Detail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700/50">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">This Month</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Month</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item) => {
                  const catConfig = getCategoryConfig(item.category);
                  return (
                    <tr key={item.category} className="border-b border-gray-100 dark:border-gray-700/30 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-2">
                        <span>{catConfig.emoji}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-white tabular-nums">
                        ₹{item['This Month'].toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                        ₹{item['Last Month'].toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
                          item.pctChange > 0
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                            : item.pctChange < 0
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.pctChange > 0 ? '↑' : item.pctChange < 0 ? '↓' : '='}{Math.abs(item.pctChange)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Analytics computed via MongoDB Aggregation Pipeline · Data scoped to your account
        </p>
      </footer>
    </div>
  );
}
