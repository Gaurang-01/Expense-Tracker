export const CATEGORIES = [
  {
    name: 'Food',
    emoji: '🍔',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700',
    barBg: 'bg-emerald-500',
    dotBg: 'bg-emerald-500',
  },
  {
    name: 'Travel',
    emoji: '✈️',
    bg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-700',
    barBg: 'bg-sky-500',
    dotBg: 'bg-sky-500',
  },
  {
    name: 'Shopping',
    emoji: '🛍️',
    bg: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-700',
    barBg: 'bg-violet-500',
    dotBg: 'bg-violet-500',
  },
  {
    name: 'Bills',
    emoji: '📄',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-700',
    barBg: 'bg-amber-500',
    dotBg: 'bg-amber-500',
  },
  {
    name: 'Entertainment',
    emoji: '🎮',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-700',
    barBg: 'bg-rose-500',
    dotBg: 'bg-rose-500',
  },
  {
    name: 'Other',
    emoji: '📦',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-600',
    barBg: 'bg-slate-500',
    dotBg: 'bg-slate-500',
  },
];

export function getCategoryConfig(categoryName) {
  return CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[5];
}
