import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/goals');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch goals');
    }
  }
);

export const addGoal = createAsyncThunk(
  'goals/addGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const res = await api.post('/goals', goalData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add goal');
    }
  }
);

export const editGoal = createAsyncThunk(
  'goals/editGoal',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/goals/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update goal');
    }
  }
);

export const contributeGoal = createAsyncThunk(
  'goals/contributeGoal',
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/goals/${id}/contribute`, { amount });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to contribute to goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/goals/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete goal');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoals: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editGoal.fulfilled, (state, action) => {
        const idx = state.items.findIndex((g) => g._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(contributeGoal.fulfilled, (state, action) => {
        const idx = state.items.findIndex((g) => g._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g._id !== action.payload);
      });
  },
});

export const { clearGoals } = goalsSlice.actions;
export default goalsSlice.reducer;
