import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signIn, signUp, signOut, getSession, getUser } from '../../lib/supabase';

interface AuthState {
  user: any | null;
  session: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSession = createAsyncThunk(
  'auth/fetchSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await getSession();
      if (error) throw error;
      
      // If we have a session, fetch the user
      if (data.session) {
        const user = await getUser();
        return { session: data.session, user };
      }
      
      return { session: null, user: null };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.session = action.payload.session;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.session = action.payload.session;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'succeeded';
        state.user = null;
        state.session = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Fetch Session
      .addCase(fetchSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSession.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.session = action.payload.session;
        state.user = action.payload.user;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 