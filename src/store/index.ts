import { configureStore } from '@reduxjs/toolkit';
// Import slices
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    // Add reducers
    auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 