import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchIncomes = createAsyncThunk(
  'income/fetchIncomes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/income');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch incomes');
    }
  }
);

export const addIncome = createAsyncThunk(
  'income/addIncome',
  async (incomeData, { rejectWithValue }) => {
    try {
      const res = await api.post('/income', incomeData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add income');
    }
  }
);

export const editIncome = createAsyncThunk(
  'income/editIncome',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/income/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update income');
    }
  }
);

export const deleteIncome = createAsyncThunk(
  'income/deleteIncome',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/income/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete income');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    clearIncomes: (state) => {
      state.items = [];
      state.error = null;
    },
    socketIncomeCreated: (state, action) => {
      const exists = state.items.some((i) => i._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    socketIncomeUpdated: (state, action) => {
      const idx = state.items.findIndex((i) => i._id === action.payload._id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
    },
    socketIncomeDeleted: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload._id : action.payload;
      state.items = state.items.filter((i) => i._id !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchIncomes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addIncome.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Edit
      .addCase(editIncome.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      // Delete
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export const { clearIncomes, socketIncomeCreated, socketIncomeUpdated, socketIncomeDeleted } = incomeSlice.actions;
export default incomeSlice.reducer;
