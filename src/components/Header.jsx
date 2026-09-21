import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectTotalBalance, selectDarkMode, selectUser } from '../store/selectors';
import { toggleDarkMode, addToast } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { clearExpenses } from '../store/slices/expensesSlice';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalBalance = useSelector(selectTotalBalance);
  const darkMode = useSelector(selectDarkMode);
  const user = useSelector(selectUser);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearExpenses());
    dispatch(addToast('Logged out successfully', 'info'));
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-black/40 border-b border-gray-100 dark:border-gray-800'
          : 'bg-white dark:bg-gray-900 border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <span className="text-white text-lg">💰</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Expense Tracker
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              MongoDB Scoped Sync
            </p>
          </div>
        </Link>

        {/* Right Section: Balance + Dark Mode + User Info + Logout */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Balance */}
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Spent
            </p>
            <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tabular-nums">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Analytics Link */}
          <Link
            to="/app/analytics"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/50 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors duration-200"
            title="Analytics Dashboard"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">Analytics</span>
          </Link>

          {/* Dark Mode Toggle */}
          <button
            id="dark-mode-toggle"
            onClick={() => dispatch(toggleDarkMode())}
            className="relative w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-xs transition-transform duration-300 ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {darkMode ? '🌙' : '☀️'}
            </span>
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-200 text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight max-w-[100px] truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
                    {user.role || 'User'}
                  </p>
                </div>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl py-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/60">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40 uppercase">
                        {user.role || 'user'}
                      </span>
                    </div>

                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
