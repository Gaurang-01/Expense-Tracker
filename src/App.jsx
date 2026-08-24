import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import Filters from './components/Filters';
import Toast from './components/Toast';
import { loadExpenses, saveExpenses, loadDarkMode, saveDarkMode } from './utils/storage';

export default function App() {
  // ── State ──────────────────────────────────────────────────────────
  const [expenses, setExpenses] = useState(() => loadExpenses());
  const [editingExpense, setEditingExpense] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useState(() => loadDarkMode());
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });

  // ── Persistence ────────────────────────────────────────────────────
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveDarkMode(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ── Toast helper ───────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── CRUD handlers ─────────────────────────────────────────────────
  function handleAdd(expense) {
    setExpenses((prev) => [expense, ...prev]);
    addToast(`"${expense.title}" added successfully!`, 'success');
  }

  function handleUpdate(updatedExpense) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
    setEditingExpense(null);
    addToast(`"${updatedExpense.title}" updated!`, 'info');
  }

  function handleDelete(id) {
    const expense = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast(`"${expense?.title}" deleted`, 'error');
  }

  function handleEdit(expense) {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingExpense(null);
  }

  // ── Filtering & sorting ───────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search by title
    if (filters.search.trim()) {
      const search = filters.search.toLowerCase().trim();
      result = result.filter((e) => e.title.toLowerCase().includes(search));
    }

    // Filter by category
    if (filters.category) {
      result = result.filter((e) => e.category === filters.category);
    }

    // Filter by date range
    if (filters.dateFrom) {
      result = result.filter((e) => e.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter((e) => e.date <= filters.dateTo);
    }

    // Sort by date (newest first)
    result.sort((a, b) => b.date.localeCompare(a.date));

    return result;
  }, [expenses, filters]);

  // ── Computed values ───────────────────────────────────────────────
  const totalBalance = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header
        totalBalance={totalBalance}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Form */}
        <ExpenseForm
          onAdd={handleAdd}
          editingExpense={editingExpense}
          onUpdate={handleUpdate}
          onCancelEdit={handleCancelEdit}
        />

        {/* Layout: Filters + Summary sidebar on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Filters filters={filters} onFilterChange={setFilters} />
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Summary expenses={expenses} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Expense Tracker · Data stored locally in your browser
        </p>
      </footer>

      {/* Toasts */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
