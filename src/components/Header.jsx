import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTotalBalance, selectDarkMode } from '../store/selectors';
import { toggleDarkMode } from '../store/slices/uiSlice';

export default function Header() {
  const dispatch = useDispatch();
  const totalBalance = useSelector(selectTotalBalance);
  const darkMode = useSelector(selectDarkMode);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-black/30'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white text-lg">💰</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Expense Tracker
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Track your spending
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-right">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Spent
            </p>
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tabular-nums">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Dark Mode Toggle */}
          <button
            id="dark-mode-toggle"
            onClick={() => dispatch(toggleDarkMode())}
            className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-sm transition-transform duration-300 ${
                darkMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            >
              {darkMode ? '🌙' : '☀️'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
