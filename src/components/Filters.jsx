import { useSelector, useDispatch } from 'react-redux';
import { CATEGORIES } from '../utils/categories';
import { selectFilters } from '../store/selectors';
import { setFilter, setSearchTerm, clearFilters } from '../store/slices/expensesSlice';

export default function Filters() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  function handleChange(field, value) {
    if (field === 'search') {
      dispatch(setSearchTerm(value));
    } else {
      dispatch(setFilter({ field, value }));
    }
  }

  const hasFilters = filters.search || filters.category || filters.dateFrom || filters.dateTo;

  const inputBase =
    'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600';

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-xs">
            🔍
          </span>
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={() => dispatch(clearFilters())}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="filter-search" className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="filter-search"
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className={`${inputBase} pl-9`}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`${inputBase} cursor-pointer`}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="filter-date-from" className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            From
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className={inputBase}
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="filter-date-to" className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            To
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className={inputBase}
          />
        </div>
      </div>
    </div>
  );
}
