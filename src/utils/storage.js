const STORAGE_KEY = 'expense-tracker-data';
const DARK_MODE_KEY = 'expense-tracker-dark';

export function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function loadDarkMode() {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    if (raw === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return raw === 'true';
  } catch {
    return false;
  }
}

export function saveDarkMode(isDark) {
  localStorage.setItem(DARK_MODE_KEY, String(isDark));
}
