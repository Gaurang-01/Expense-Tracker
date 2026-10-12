import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/budgets${query ? `?${query}` : ''}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch budgets');
    }
  }
);

export const upsertBudget = createAsyncThunk(
  'budgets/upsertBudget',
  async (budgetData, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/budgets', budgetData);
      // Re-fetch to get updated spent calculations
      dispatch(fetchBudgets());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/budgets/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete budget');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgets: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      });
  },
});

export const { clearBudgets } = budgetsSlice.actions;
export default budgetsSlice.reducer;
