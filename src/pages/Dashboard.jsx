import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectUser,
  selectTotalIncome,
  selectTotalBalance,
  selectNetBalance,
  selectExpenseItems,
  selectIncomeItems,
  selectBudgetItems,
  selectGoalItems,
  selectRecurringItems,
  selectInvestmentSummary,
  selectGroupItems,
} from '../store/selectors';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { fetchIncomes } from '../store/slices/incomeSlice';
import { fetchBudgets } from '../store/slices/budgetsSlice';
import { fetchGoals } from '../store/slices/goalsSlice';
import { fetchRecurring } from '../store/slices/recurringSlice';
import { fetchInvestments } from '../store/slices/investmentsSlice';
import { fetchGroups } from '../store/slices/groupsSlice';
import AppLayout from '../components/AppLayout';

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const totalIncome = useSelector(selectTotalIncome);
  const totalExpenses = useSelector(selectTotalBalance);
  const netBalance = useSelector(selectNetBalance);

  const expenses = useSelector(selectExpenseItems);
  const incomes = useSelector(selectIncomeItems);
  const budgets = useSelector(selectBudgetItems);
  const goals = useSelector(selectGoalItems);
  const recurring = useSelector(selectRecurringItems);
  const investmentSummary = useSelector(selectInvestmentSummary);
  const groups = useSelector(selectGroupItems);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchIncomes());
    dispatch(fetchBudgets());
    dispatch(fetchGoals());
    dispatch(fetchRecurring());
    dispatch(fetchInvestments());
    dispatch(fetchGroups());
  }, [dispatch]);

  // Savings rate calculation
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  // Nearest goal
  const uncompletedGoals = goals.filter((g) => (g.currentAmount || 0) < g.targetAmount);
  const nearestGoal = uncompletedGoals[0] || goals[0];

  // Upcoming bills in recurring
  const upcomingBills = [...recurring]
    .filter((r) => r.isActive !== false)
    .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue))
    .slice(0, 3);

  // Recent transactions combined
  const recentTransactions = [
    ...expenses.map((e) => ({ ...e, txnType: 'expense' })),
    ...incomes.map((i) => ({ ...i, title: i.source, txnType: 'income' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <AppLayout>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}! 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here is your unified financial health overview across all cash flows and portfolios.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/app/expenses"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            ＋ Add Expense
          </Link>
          <Link
            to="/app/income"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            ＋ Add Income
          </Link>
        </div>
      </div>

      {/* Hero Financial Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Balance Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15 text-5xl">💎</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Net Balance
            </p>
            <p className="text-2xl sm:text-3xl font-black mt-1 tabular-nums">
              ₹{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-100">
            <span>Savings Rate:</span>
            <span className="font-bold text-emerald-300">{savingsRate}%</span>
          </div>
        </div>

        {/* Income Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Total Income
              </p>
              <span className="text-lg">💵</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Link
            to="/app/income"
            className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between"
          >
            <span>{incomes.length} inflow entries</span>
            <span>View ➔</span>
          </Link>
        </div>

        {/* Expense Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Total Expenses
              </p>
              <span className="text-lg">💸</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Link
            to="/app/expenses"
            className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-between"
          >
            <span>{expenses.length} tracked items</span>
            <span>Manage ➔</span>
          </Link>
        </div>

        {/* Investments Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Investments Valuation
              </p>
              <span className="text-lg">📈</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
              ₹{Number(investmentSummary.totalCurrent || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <Link
            to="/app/investments"
            className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between"
          >
            <span>
              ROI: {investmentSummary.percentageGainLoss >= 0 ? '+' : ''}{Number(investmentSummary.percentageGainLoss || 0).toFixed(1)}%
            </span>
            <span>Portfolio ➔</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Main Section: Left widgets & Right widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Budget Health & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Health Guardrails */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Monthly Budget Guardrails
                </h3>
                <p className="text-xs text-gray-400">Category spending limits & threshold warnings</p>
              </div>
              <Link
                to="/app/budgets"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All Budgets ➔
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No category budgets set yet.{' '}
                <Link to="/app/budgets" className="text-indigo-600 underline">Set one now</Link> to prevent overspending.
              </div>
            ) : (
              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => {
                  const pct = b.percentage || 0;
                  const barColor = pct >= 100 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

                  return (
                    <div key={b._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{b.category}</span>
                        <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                          ₹{Number(b.spent).toLocaleString('en-IN')} / ₹{Number(b.limit).toLocaleString('en-IN')}{' '}
                          <strong className={pct >= 100 ? 'text-rose-600' : pct >= 70 ? 'text-amber-500' : 'text-emerald-600'}>
                            ({pct}%)
                          </strong>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Combined Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Recent Cash Movements
              </h3>
              <span className="text-xs text-gray-400">Latest entries</span>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No recent activity recorded.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentTransactions.map((item, idx) => {
                  const isInc = item.txnType === 'income';
                  return (
                    <div key={item._id || idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isInc ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60'
                        }`}>
                          {isInc ? '↓' : '↑'}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {item.category || item.source || 'General'}
                          </p>
                        </div>
                      </div>

                      <span className={`font-bold text-sm tabular-nums ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                        {isInc ? '+' : '-'}₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Goals, Recurring, Family Groups */}
        <div className="space-y-6">
          {/* Nearest Savings Goal Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider text-gray-400">
                🎯 Target Goal
              </h3>
              <Link to="/app/goals" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                View all ➔
              </Link>
            </div>

            {nearestGoal ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">
                    {nearestGoal.title}
                  </h4>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.min(100, Math.round(((nearestGoal.currentAmount || 0) / (nearestGoal.targetAmount || 1)) * 100))}%
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    style={{
                      width: `${Math.min(100, Math.round(((nearestGoal.currentAmount || 0) / (nearestGoal.targetAmount || 1)) * 100))}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 tabular-nums">
                  <span>Saved: ₹{Number(nearestGoal.currentAmount || 0).toLocaleString('en-IN')}</span>
                  <span>Target: ₹{Number(nearestGoal.targetAmount).toLocaleString('en-IN')}</span>
                </div>

                <Link
                  to="/app/goals"
                  className="mt-3 block w-full text-center py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors"
                >
                  Contribute to Goal
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No active goals. Create one to stay motivated!</p>
            )}
          </div>

          {/* Upcoming Bills Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider text-gray-400">
                🔄 Upcoming Subscriptions
              </h3>
              <Link to="/app/recurring" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Manage ➔
              </Link>
            </div>

            {upcomingBills.length === 0 ? (
              <p className="text-xs text-gray-400">No active recurring bills scheduled.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingBills.map((b) => (
                  <div key={b._id} className="p-2.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{b.title}</p>
                      <p className="text-[10px] text-gray-400">
                        Due: {new Date(b.nextDue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      ₹{Number(b.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Family Groups Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider text-gray-400">
                👥 Shared Groups
              </h3>
              <Link to="/app/groups" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Explore ➔
              </Link>
            </div>

            {groups.length === 0 ? (
              <p className="text-xs text-gray-400">No active groups. Split bills with roommates or family.</p>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 2).map((g) => (
                  <Link
                    key={g._id}
                    to="/app/groups"
                    className="block p-2.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">{g.name}</span>
                      <span className="text-gray-400">{g.members?.length || 1} members</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
