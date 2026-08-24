import { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/categories';

const emptyForm = {
  title: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
};

export default function ExpenseForm({ onAdd, editingExpense, onUpdate, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingExpense;

  useEffect(() => {
    if (editingExpense) {
      setForm({
        title: editingExpense.title,
        amount: String(editingExpense.amount),
        category: editingExpense.category,
        date: editingExpense.date,
      });
      setErrors({});
    } else {
      setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    }
  }, [editingExpense]);

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Enter a valid positive amount';
    }
    if (!form.date) {
      newErrors.date = 'Date is required';
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (form.date > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const expense = {
      id: isEditing ? editingExpense.id : Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: form.title.trim(),
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      category: form.category,
      date: form.date,
    };

    setTimeout(() => {
      if (isEditing) {
        onUpdate(expense);
      } else {
        onAdd(expense);
      }
      setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
      setErrors({});
      setIsSubmitting(false);
    }, 150);
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const inputBase =
    'w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  const inputError = 'border-rose-400 dark:border-rose-500';
  const inputNormal = 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 sm:p-6 shadow-sm"
    >
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">
          {isEditing ? '✏️' : '➕'}
        </span>
        {isEditing ? 'Edit Expense' : 'Add Expense'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Title */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="expense-title" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Title
          </label>
          <input
            id="expense-title"
            type="text"
            placeholder="e.g., Lunch at cafe"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`${inputBase} ${errors.title ? inputError : inputNormal}`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500 animate-fade-in-up">{errors.title}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="expense-amount" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Amount (₹)
          </label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className={`${inputBase} ${errors.amount ? inputError : inputNormal}`}
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-500 animate-fade-in-up">{errors.amount}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="expense-category" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Category
          </label>
          <select
            id="expense-category"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`${inputBase} ${inputNormal} cursor-pointer`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="expense-date" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            value={form.date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleChange('date', e.target.value)}
            className={`${inputBase} ${errors.date ? inputError : inputNormal}`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rose-500 animate-fade-in-up">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-5">
        <button
          id="expense-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : isEditing ? (
            'Update Expense'
          ) : (
            'Add Expense'
          )}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
