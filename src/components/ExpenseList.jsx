import ExpenseItem from './ExpenseItem';
import EmptyState from './EmptyState';

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-xs">
            📋
          </span>
          Expenses
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full tabular-nums">
          {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-2">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
