import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectToken, selectIsInitialized, selectAuthLoading } from '../store/selectors';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const isInitialized = useSelector(selectIsInitialized);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();

  // If initial auth check has not completed yet
  if (!isInitialized || (token && !isAuthenticated && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-bounce">
            <span className="text-white text-xl">🔒</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Verifying session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated -> Redirect to /login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
