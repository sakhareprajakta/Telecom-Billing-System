import { createSlice } from '@reduxjs/toolkit';

const initialUser = (() => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: localStorage.getItem('token') || null,
    role: initialUser?.role || 'CUSTOMER',
    isAuthenticated: !!initialUser,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = user?.role || 'CUSTOMER';
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logoutUser } = authSlice.actions;
export default authSlice.reducer;
