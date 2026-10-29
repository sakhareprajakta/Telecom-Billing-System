import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import billingReducer from './slices/billingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    billing: billingReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
