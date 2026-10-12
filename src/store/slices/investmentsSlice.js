import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchInvestments = createAsyncThunk(
  'investments/fetchInvestments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/investments');
      return {
        items: res.data || [],
        summary: res.summary || {
          totalInvested: 0,
          totalCurrent: 0,
          totalGainLoss: 0,
          percentageGainLoss: 0,
          allocation: [],
        },
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch investments');
    }
  }
);

export const addInvestment = createAsyncThunk(
  'investments/addInvestment',
  async (investmentData, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/investments', investmentData);
      dispatch(fetchInvestments());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add investment');
    }
  }
);

export const editInvestment = createAsyncThunk(
  'investments/editInvestment',
  async ({ id, ...data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.put(`/investments/${id}`, data);
      dispatch(fetchInvestments());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update investment');
    }
  }
);

export const deleteInvestment = createAsyncThunk(
  'investments/deleteInvestment',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/investments/${id}`);
      dispatch(fetchInvestments());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete investment');
    }
  }
);

const initialState = {
  items: [],
  summary: {
    totalInvested: 0,
    totalCurrent: 0,
    totalGainLoss: 0,
    percentageGainLoss: 0,
    allocation: [],
  },
  loading: false,
  error: null,
};

const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    clearInvestments: (state) => {
      state.items = [];
      state.summary = initialState.summary;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvestments } = investmentsSlice.actions;
export default investmentsSlice.reducer;
