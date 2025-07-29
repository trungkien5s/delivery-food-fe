import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  isLoggedIn: false,
  user: null,
  showAuthModal: false,
  authMode: "login", // "login" or "register"
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    setShowAuthModal: (state, action) => {
      state.showAuthModal = action.payload;
      if (!action.payload) {
        state.error = null;
      }
    },
    setAuthMode: (state, action) => {
      state.authMode = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { login, logout, setShowAuthModal, setAuthMode, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;