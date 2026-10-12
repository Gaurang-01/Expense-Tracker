import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket, connectSocket } from '../lib/socket';
import {
  socketExpenseCreated,
  socketExpenseUpdated,
  socketExpenseDeleted,
} from '../store/slices/expensesSlice';
import { socketNotificationReceived } from '../store/slices/notificationsSlice';
import { socketRecurringProcessed } from '../store/slices/recurringSlice';
import { socketGroupUpdated } from '../store/slices/groupsSlice';
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

    const handleNotificationNew = (notification) => {
      dispatch(socketNotificationReceived(notification));
      if (notification?.title) {
        dispatch(addToast(`${notification.title}: ${notification.message}`, 'info'));
      }
    };

    const handleRecurringProcessed = (payload) => {
      dispatch(socketRecurringProcessed(payload));
      if (payload?.expense) {
        dispatch(socketExpenseCreated(payload.expense));
      }
      dispatch(addToast(`Recurring expense processed: ${payload?.expense?.title || 'Bill'}`, 'info'));
    };

    const handleGroupUpdated = (group) => {
      dispatch(socketGroupUpdated(group));
    };

    socket.on('expense:created', handleExpenseCreated);
    socket.on('expense:updated', handleExpenseUpdated);
    socket.on('expense:deleted', handleExpenseDeleted);
    socket.on('analytics:updated', handleAnalyticsUpdated);
    socket.on('budget:alert', handleBudgetAlert);
    socket.on('notification:new', handleNotificationNew);
    socket.on('recurring:processed', handleRecurringProcessed);
    socket.on('group:updated', handleGroupUpdated);

    return () => {
      socket.off('expense:created', handleExpenseCreated);
      socket.off('expense:updated', handleExpenseUpdated);
      socket.off('expense:deleted', handleExpenseDeleted);
      socket.off('analytics:updated', handleAnalyticsUpdated);
      socket.off('budget:alert', handleBudgetAlert);
      socket.off('notification:new', handleNotificationNew);
      socket.off('recurring:processed', handleRecurringProcessed);
      socket.off('group:updated', handleGroupUpdated);
    };
  }, [dispatch, isAuthenticated, token]);
}

export default useRealtimeSync;
