import { createSelector } from '@reduxjs/toolkit';
import { CATEGORIES } from '../utils/categories';

// ── Auth selectors ─────────────────────────────────────────────────────
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsInitialized = (state) => state.auth.isInitialized;

// ── Expenses selectors ─────────────────────────────────────────────────
export const selectExpenseItems = (state) => state.expenses.items;
export const selectExpensesLoading = (state) => state.expenses.loading;
export const selectExpensesError = (state) => state.expenses.error;
export const selectFilters = (state) => state.expenses.filters;
export const selectEditingExpense = (state) => state.expenses.editingExpense;

// ── UI selectors ───────────────────────────────────────────────────────
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectToasts = (state) => state.ui.toasts;

// ── Memoized: filtered + sorted expenses ──────────────────────────────
export const selectFilteredExpenses = createSelector(
  [selectExpenseItems, selectFilters],
  (items, filters) => {
    let result = [...(items || [])];

    // Search by title
    if (filters.search && filters.search.trim()) {
      const search = filters.search.toLowerCase().trim();
      result = result.filter((e) => e.title && e.title.toLowerCase().includes(search));
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
    result.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA);
    });

    return result;
  }
);

// ── Memoized: total balance ───────────────────────────────────────────
export const selectTotalBalance = createSelector(
  [selectExpenseItems],
  (items) => (items || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
);

// ── Memoized: category summary ────────────────────────────────────────
export const selectCategorySummary = createSelector(
  [selectExpenseItems],
  (items = []) => {
    const totals = CATEGORIES.map((cat) => {
      const total = items
        .filter((e) => e.category === cat.name)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      return { ...cat, total };
    }).filter((cat) => cat.total > 0);

    const maxTotal = totals.length > 0 ? Math.max(...totals.map((c) => c.total)) : 0;
    const grandTotal = items.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    return { totals, maxTotal, grandTotal };
  }
);
