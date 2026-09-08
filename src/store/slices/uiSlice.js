import { createSlice } from '@reduxjs/toolkit';
import { loadDarkMode } from '../../utils/storage';

const initialState = {
  darkMode: loadDarkMode(),
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
    },
    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(message, type = 'success') {
        return {
          payload: {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            message,
            type,
          },
        };
      },
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleDarkMode, setDarkMode, addToast, removeToast } = uiSlice.actions;

export default uiSlice.reducer;
