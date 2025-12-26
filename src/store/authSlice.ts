import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  userId?: string | null;
  mobileNumber?: string | null;
  email?: string | null;
  token?: string | null;
  refreshToken?: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  mobileNumber: null,
  email: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<Partial<AuthState>>) {
      return { ...state, ...action.payload, isAuthenticated: action.payload.isAuthenticated ?? true } as AuthState;
    },
    clearAuth() {
      return initialState;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
