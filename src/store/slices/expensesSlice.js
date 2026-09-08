import { createSlice } from '@reduxjs/toolkit';
import { loadExpenses } from '../../utils/storage';

const initialState = {
  items: loadExpenses(),
  editingExpense: null,
  filters: {
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  },
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense(state, action) {
      state.items.unshift(action.payload);
    },
    editExpense(state, action) {
      const index = state.items.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.editingExpense = null;
    },
    deleteExpense(state, action) {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
    setEditingExpense(state, action) {
      state.editingExpense = action.payload;
    },
    clearEditingExpense(state) {
      state.editingExpense = null;
    },
    setFilter(state, action) {
      // action.payload = { field: 'category', value: 'Food' }
      const { field, value } = action.payload;
      state.filters[field] = value;
    },
    setSearchTerm(state, action) {
      state.filters.search = action.payload;
    },
    clearFilters(state) {
      state.filters = { search: '', category: '', dateFrom: '', dateTo: '' };
    },
    setAllFilters(state, action) {
      state.filters = action.payload;
    },
  },
});

export const {
  addExpense,
  editExpense,
  deleteExpense,
  setEditingExpense,
  clearEditingExpense,
  setFilter,
  setSearchTerm,
  clearFilters,
  setAllFilters,
} = expensesSlice.actions;

export default expensesSlice.reducer;
