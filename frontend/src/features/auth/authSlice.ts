import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// Types
interface AuthState {
  user: any | null;
  profile: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchSession = createAsyncThunk(
  'auth/fetchSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      if (!session) {
        return null;
      }
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }
      
      return {
        user: session.user,
        profile: profile || null
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }
      
      return {
        user: data.user,
        profile: profile || null
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return null;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSession
      .addCase(fetchSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.user = action.payload.user;
          state.profile = action.payload.profile;
        } else {
          state.user = null;
          state.profile = null;
        }
        state.error = null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // signIn
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // signOut
      .addCase(signOut.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.status = 'succeeded';
        state.user = null;
        state.profile = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 