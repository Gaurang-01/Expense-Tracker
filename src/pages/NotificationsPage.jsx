import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectNotificationItems, selectUnreadCount, selectNotificationsLoading } from '../store/selectors';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../store/slices/notificationsSlice';
import { addToast } from '../store/slices/uiSlice';
import AppLayout from '../components/AppLayout';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotificationItems);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'budget_alert', 'goal_reached', 'recurring_processed'

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

  const handleMarkRead = async (id) => {
    try {
      await dispatch(markNotificationRead(id)).unwrap();
    } catch (err) {
      dispatch(addToast(err || 'Failed to update', 'error'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsRead()).unwrap();
      dispatch(addToast('All notifications marked as read', 'success'));
    } catch (err) {
      dispatch(addToast(err || 'Failed to update', 'error'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      dispatch(addToast('Notification dismissed', 'info'));
    } catch (err) {
      dispatch(addToast(err || 'Failed to delete', 'error'));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'budget_alert':
        return '⚠️';
      case 'goal_reached':
        return '🎯';
      case 'recurring_processed':
        return '🔄';
      case 'group_activity':
        return '👥';
      case 'anomaly':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  const filteredList = notifications.filter((n) => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Notification Center
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time triggers, budget limit alerts, recurring receipts, and goal milestones
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors"
          >
            ✓ Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'budget_alert', label: 'Budget Alerts' },
          { id: 'goal_reached', label: 'Goals' },
          { id: 'recurring_processed', label: 'Recurring' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === f.id
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <span className="text-4xl block mb-2">🎉</span>
            <p className="font-semibold text-gray-700 dark:text-gray-300">You're all caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No alerts or updates matching this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredList.map((n) => (
              <div
                key={n._id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  n.read
                    ? 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                    : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <span className="text-2xl mt-0.5 flex-shrink-0">{getTypeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm sm:text-base ${n.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
