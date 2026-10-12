import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/groups');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch groups');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/groups', groupData);
      dispatch(fetchGroups());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create group');
    }
  }
);

export const inviteGroupMember = createAsyncThunk(
  'groups/inviteMember',
  async ({ groupId, email }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/groups/${groupId}/invite`, { email });
      dispatch(fetchGroups());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to invite member');
    }
  }
);

export const addGroupExpense = createAsyncThunk(
  'groups/addGroupExpense',
  async ({ groupId, ...expenseData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/groups/${groupId}/expenses`, expenseData);
      dispatch(fetchGroups());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add shared expense');
    }
  }
);

export const settleGroupSplit = createAsyncThunk(
  'groups/settleSplit',
  async ({ groupId, expenseId, memberId }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/groups/${groupId}/settle`, { expenseId, memberId });
      dispatch(fetchGroups());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to settle debt');
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      await api.delete(`/groups/${groupId}`);
      return groupId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete group');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroups: (state) => {
      state.items = [];
      state.error = null;
    },
    socketGroupUpdated: (state, action) => {
      const idx = state.items.findIndex((g) => g._id === action.payload._id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g._id !== action.payload);
      });
  },
});

export const { clearGroups, socketGroupUpdated } = groupsSlice.actions;
export default groupsSlice.reducer;
