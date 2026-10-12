import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/app', icon: '⚡', exact: true },
  { name: 'Expenses', path: '/app/expenses', icon: '💸' },
  { name: 'Income', path: '/app/income', icon: '💵' },
  { name: 'Budgets', path: '/app/budgets', icon: '📊' },
  { name: 'Goals', path: '/app/goals', icon: '🎯' },
  { name: 'Recurring', path: '/app/recurring', icon: '🔄' },
  { name: 'Investments', path: '/app/investments', icon: '📈' },
  { name: 'Family Groups', path: '/app/groups', icon: '👥' },
  { name: 'Analytics', path: '/app/analytics', icon: '📉' },
];

export default function Navigation() {
  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[61px] z-40 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
