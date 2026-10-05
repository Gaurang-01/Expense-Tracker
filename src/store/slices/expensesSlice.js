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
    // ── Real-Time Socket.IO Reducers ──────────────────────────────────
    socketExpenseCreated(state, action) {
      if (!action.payload) return;
      const raw = action.payload;
      const targetId = raw._id || raw.id;
      // Guard against double-insert: if already present in state, ignore
      const exists = state.items.some((item) => (item._id && item._id === targetId) || (item.id && item.id === targetId));
      if (!exists) {
        const newItem = {
          ...raw,
          id: targetId,
          date: raw.date ? (typeof raw.date === 'string' ? raw.date.split('T')[0] : raw.date) : raw.date,
        };
        state.items.unshift(newItem);
      }
    },
    socketExpenseUpdated(state, action) {
      if (!action.payload) return;
      const raw = action.payload;
      const targetId = raw._id || raw.id;
      const updatedItem = {
        ...raw,
        id: targetId,
        date: raw.date ? (typeof raw.date === 'string' ? raw.date.split('T')[0] : raw.date) : raw.date,
      };
      const index = state.items.findIndex(
        (item) => (item._id && item._id === targetId) || (item.id && item.id === targetId)
      );
      if (index !== -1) {
        state.items[index] = updatedItem;
      } else {
        // If not found, add it
        state.items.unshift(updatedItem);
      }
    },
    socketExpenseDeleted(state, action) {
      const targetId = typeof action.payload === 'object' ? (action.payload._id || action.payload.id) : action.payload;
      if (!targetId) return;
      state.items = state.items.filter(
        (item) => item.id !== targetId && item._id !== targetId
      );
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
          date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : item.date) : item.date,
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
        const targetId = action.payload._id || action.payload.id;
        const exists = state.items.some((item) => (item._id && item._id === targetId) || (item.id && item.id === targetId));
        if (!exists) {
          const newItem = {
            ...action.payload,
            id: targetId,
            date: action.payload.date ? (typeof action.payload.date === 'string' ? action.payload.date.split('T')[0] : action.payload.date) : action.payload.date,
          };
          state.items.unshift(newItem);
        }
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
        const targetId = action.payload._id || action.payload.id;
        const updatedItem = {
          ...action.payload,
          id: targetId,
          date: action.payload.date ? (typeof action.payload.date === 'string' ? action.payload.date.split('T')[0] : action.payload.date) : action.payload.date,
        };
        const index = state.items.findIndex((e) => e.id === targetId || e._id === targetId);
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
        const targetId = action.payload;
        state.items = state.items.filter(
          (e) => e.id !== targetId && e._id !== targetId
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
  socketExpenseCreated,
  socketExpenseUpdated,
  socketExpenseDeleted,
} = expensesSlice.actions;

export default expensesSlice.reducer;
