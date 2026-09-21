import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// ── Async Thunks ───────────────────────────────────────────────────────

// Fetch all expenses for the logged-in user
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/expenses');
      return response.data; // Array of expense objects from MongoDB
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch expenses');
    }
  }
);

// Add a new expense
export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add expense');
    }
  }
);

// Update an existing expense
export const editExpense = createAsyncThunk(
  'expenses/editExpense',
  async ({ id, ...expenseData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update expense');
    }
  }
);

// Delete an expense
export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete expense');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
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
    setEditingExpense(state, action) {
      state.editingExpense = action.payload;
    },
    clearEditingExpense(state) {
      state.editingExpense = null;
    },
    setFilter(state, action) {
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
    clearExpenses(state) {
      state.items = [];
      state.editingExpense = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Expenses ───────────────────────────────────────────────
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize expenses so each item has a consistent id field
        state.items = (action.payload || []).map((item) => ({
          ...item,
          id: item._id || item.id,
          date: item.date ? item.date.split('T')[0] : item.date,
        }));
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Add Expense ──────────────────────────────────────────────────
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = {
          ...action.payload,
          id: action.payload._id || action.payload.id,
          date: action.payload.date ? action.payload.date.split('T')[0] : action.payload.date,
        };
        state.items.unshift(newItem);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Edit Expense ─────────────────────────────────────────────────
      .addCase(editExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(editExpense.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = {
          ...action.payload,
          id: action.payload._id || action.payload.id,
          date: action.payload.date ? action.payload.date.split('T')[0] : action.payload.date,
        };
        const index = state.items.findIndex((e) => e.id === updatedItem.id || e._id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
        state.editingExpense = null;
      })
      .addCase(editExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete Expense ───────────────────────────────────────────────
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (e) => e.id !== action.payload && e._id !== action.payload
        );
      });
  },
});

export const {
  setEditingExpense,
  clearEditingExpense,
  setFilter,
  setSearchTerm,
  clearFilters,
  setAllFilters,
  clearExpenses,
} = expensesSlice.actions;

export default expensesSlice.reducer;
