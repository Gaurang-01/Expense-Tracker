import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import useRealtimeSync from './hooks/useRealtimeSync';

const LandingPage = lazy(() => import('./landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const IncomePage = lazy(() => import('./pages/IncomePage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const RecurringPage = lazy(() => import('./pages/RecurringPage'));
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

export default function AppRouter() {
  const dispatch = useDispatch();

  // Attach global authenticated Socket.IO listeners
  useRealtimeSync();

  useEffect(() => {
    // Attempt session restore on initial load
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
              <span className="text-white text-lg">💰</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading…</p>
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/income"
          element={
            <ProtectedRoute>
              <IncomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/budgets"
          element={
            <ProtectedRoute>
              <BudgetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/recurring"
          element={
            <ProtectedRoute>
              <RecurringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/investments"
          element={
            <ProtectedRoute>
              <InvestmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
