import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
interface AuthState {
  user: null | { id: string; email: string; role: string };
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Define the initial state using that type
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ id: string; email: string; role: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAuth = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer; 