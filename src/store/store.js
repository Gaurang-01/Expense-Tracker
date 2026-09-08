import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from './slices/expensesSlice';
import uiReducer from './slices/uiSlice';
import { saveExpenses, saveDarkMode } from '../utils/storage';

const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    ui: uiReducer,
  },
});

// ── LocalStorage persistence via store subscription ───────────────────
let previousExpenses = store.getState().expenses.items;
let previousDarkMode = store.getState().ui.darkMode;

store.subscribe(() => {
  const state = store.getState();

  // Only persist when the values actually change
  if (state.expenses.items !== previousExpenses) {
    previousExpenses = state.expenses.items;
    saveExpenses(state.expenses.items);
  }

  if (state.ui.darkMode !== previousDarkMode) {
    previousDarkMode = state.ui.darkMode;
    saveDarkMode(state.ui.darkMode);
    document.documentElement.classList.toggle('dark', state.ui.darkMode);
  }
});

// Sync dark mode class on initial load
document.documentElement.classList.toggle('dark', store.getState().ui.darkMode);

export default store;
