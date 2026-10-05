import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket, connectSocket } from '../lib/socket';
import {
  socketExpenseCreated,
  socketExpenseUpdated,
  socketExpenseDeleted,
} from '../store/slices/expensesSlice';
import { addToast } from '../store/slices/uiSlice';

/**
 * Custom React Hook that establishes room-scoped Socket.IO listeners
 * Dispatches real-time CRUD actions into Redux without requiring manual page re-fetches
 */
export function useRealtimeSync() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated && !token) return;

    // Ensure socket connection is initiated
    connectSocket();

    const handleExpenseCreated = (expense) => {
      dispatch(socketExpenseCreated(expense));
    };

    const handleExpenseUpdated = (expense) => {
      dispatch(socketExpenseUpdated(expense));
    };

    const handleExpenseDeleted = (payload) => {
      dispatch(socketExpenseDeleted(payload));
    };

    const handleAnalyticsUpdated = (analyticsData) => {
      // Broadcast to any mounted analytics consumers
      window.dispatchEvent(
        new CustomEvent('socket:analytics:updated', { detail: analyticsData })
      );
    };

    const handleBudgetAlert = (alert) => {
      const message =
        typeof alert === 'string'
          ? alert
          : alert?.message || 'Budget threshold alert: Limit exceeded!';
      dispatch(addToast(message, 'warning'));
    };

    socket.on('expense:created', handleExpenseCreated);
    socket.on('expense:updated', handleExpenseUpdated);
    socket.on('expense:deleted', handleExpenseDeleted);
    socket.on('analytics:updated', handleAnalyticsUpdated);
    socket.on('budget:alert', handleBudgetAlert);

    return () => {
      socket.off('expense:created', handleExpenseCreated);
      socket.off('expense:updated', handleExpenseUpdated);
      socket.off('expense:deleted', handleExpenseDeleted);
      socket.off('analytics:updated', handleAnalyticsUpdated);
      socket.off('budget:alert', handleBudgetAlert);
    };
  }, [dispatch, isAuthenticated, token]);
}

export default useRealtimeSync;
