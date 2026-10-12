import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchRecurring = createAsyncThunk(
  'recurring/fetchRecurring',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/recurring');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recurring expenses');
    }
  }
);

export const addRecurring = createAsyncThunk(
  'recurring/addRecurring',
  async (recurringData, { rejectWithValue }) => {
    try {
      const res = await api.post('/recurring', recurringData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add recurring expense');
    }
  }
);

export const editRecurring = createAsyncThunk(
  'recurring/editRecurring',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/recurring/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update recurring expense');
    }
  }
);

export const deleteRecurring = createAsyncThunk(
  'recurring/deleteRecurring',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/recurring/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete recurring expense');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const recurringSlice = createSlice({
  name: 'recurring',
  initialState,
  reducers: {
    clearRecurring: (state) => {
      state.items = [];
      state.error = null;
    },
    socketRecurringProcessed: (state, action) => {
      // action.payload: { expense, recurring }
      if (action.payload?.recurring?._id) {
        const idx = state.items.findIndex((r) => r._id === action.payload.recurring._id);
        if (idx !== -1) {
          state.items[idx] = action.payload.recurring;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecurring.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurring.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchRecurring.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addRecurring.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editRecurring.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteRecurring.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearRecurring, socketRecurringProcessed } = recurringSlice.actions;
export default recurringSlice.reducer;
