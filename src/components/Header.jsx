import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectTotalBalance, selectNetBalance, selectDarkMode, selectUser } from '../store/selectors';
import { toggleDarkMode, addToast } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { clearExpenses } from '../store/slices/expensesSlice';
import { socket } from '../lib/socket';
import BellIcon from './BellIcon';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalBalance = useSelector(selectTotalBalance);
  const netBalance = useSelector(selectNetBalance);
  const darkMode = useSelector(selectDarkMode);
  const user = useSelector(selectUser);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track real-time socket connection events
  useEffect(() => {
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);
    const onConnectError = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    setIsSocketConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
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
        {/* Logo & Title & Real-time Live Connection Dot */}
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <span className="text-white text-lg">💰</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                FinanceFlow
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Personal Finance Manager
              </p>
            </div>
          </Link>

          {/* Live Socket.IO connection status indicator */}
          {user && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-300 ${
                isSocketConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
              }`}
              title={
                isSocketConnected
                  ? 'Real-Time Sync Connected (Live updates enabled)'
                  : 'Real-Time Sync Disconnected (Reconnecting...)'
              }
            >
              <span className="relative flex h-2 w-2">
                {isSocketConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isSocketConnected
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                      : 'bg-gray-400 dark:bg-gray-600'
                  }`}
                ></span>
              </span>
              <span className="hidden md:inline">
                {isSocketConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Balance + Dark Mode + User Info + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Net Balance & Spent Pill */}
          <div className="text-right hidden sm:flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Net Balance
              </p>
              <p className={`text-xs sm:text-sm font-bold tabular-nums ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ₹{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Spent
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums">
                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Notifications Bell */}
          {user && <BellIcon />}

          {/* Dark Mode Toggle */}
          <button
            id="dark-mode-toggle"
            onClick={() => dispatch(toggleDarkMode())}
            className="relative w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-xs transition-transform duration-300 ${
                darkMode ? 'translate-x-5' : 'translate-x-0'
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
