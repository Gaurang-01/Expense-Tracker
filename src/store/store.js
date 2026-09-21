import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './slices/authSlice';
import expensesReducer from './slices/expensesSlice';
import uiReducer from './slices/uiSlice';
import { saveDarkMode } from '../utils/storage';

const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
    ui: uiReducer,
  },
});

// ── Dark mode persistence via store subscription ──────────────────────
let previousDarkMode = store.getState().ui.darkMode;

store.subscribe(() => {
  const state = store.getState();

  if (state.ui.darkMode !== previousDarkMode) {
    previousDarkMode = state.ui.darkMode;
    saveDarkMode(state.ui.darkMode);
    document.documentElement.classList.toggle('dark', state.ui.darkMode);
  }
});

// Sync dark mode class on initial load
document.documentElement.classList.toggle('dark', store.getState().ui.darkMode);

// Listen for global auth:expired event from API client
if (typeof window !== 'undefined') {
  window.addEventListener('auth:expired', () => {
    store.dispatch(logout());
  });
}

export default store;
