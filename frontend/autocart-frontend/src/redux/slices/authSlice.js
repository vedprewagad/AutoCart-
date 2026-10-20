import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // Accepts either { user fields... } or { user: {...}, token: "..." }
    setUser: (state, action) => {
      const payload = action.payload;
      if (payload && payload.token !== undefined) {
        // Full payload with token (from login or /auth/me refresh)
        const { token, ...userFields } = payload;
        state.user = userFields;
        state.token = token || null;
      } else {
        // Plain user object
        state.user = payload;
      }
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, logout, setLoading, clearError } = authSlice.actions;

export default authSlice.reducer;
