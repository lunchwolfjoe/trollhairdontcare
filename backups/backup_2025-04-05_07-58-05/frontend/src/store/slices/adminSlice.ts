import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface User {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface Festival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'completed';
}

interface AdminState {
  users: User[];
  festivals: Festival[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  selectedFestival: Festival | null;
}

const initialState: AdminState = {
  users: [],
  festivals: [],
  loading: false,
  error: null,
  selectedUser: null,
  selectedFestival: null,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setFestivals: (state, action: PayloadAction<Festival[]>) => {
      state.festivals = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setSelectedFestival: (state, action: PayloadAction<Festival | null>) => {
      state.selectedFestival = action.payload;
    },
  },
});

export const {
  setUsers,
  setFestivals,
  setLoading,
  setError,
  setSelectedUser,
  setSelectedFestival,
} = adminSlice.actions;

export const selectUsers = (state: RootState) => state.admin.users;
export const selectFestivals = (state: RootState) => state.admin.festivals;
export const selectLoading = (state: RootState) => state.admin.loading;
export const selectError = (state: RootState) => state.admin.error;
export const selectSelectedUser = (state: RootState) => state.admin.selectedUser;
export const selectSelectedFestival = (state: RootState) => state.admin.selectedFestival;

export default adminSlice.reducer; 
import { RootState } from '../store';

interface User {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface Festival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'completed';
}

interface AdminState {
  users: User[];
  festivals: Festival[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  selectedFestival: Festival | null;
}

const initialState: AdminState = {
  users: [],
  festivals: [],
  loading: false,
  error: null,
  selectedUser: null,
  selectedFestival: null,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setFestivals: (state, action: PayloadAction<Festival[]>) => {
      state.festivals = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setSelectedFestival: (state, action: PayloadAction<Festival | null>) => {
      state.selectedFestival = action.payload;
    },
  },
});

export const {
  setUsers,
  setFestivals,
  setLoading,
  setError,
  setSelectedUser,
  setSelectedFestival,
} = adminSlice.actions;

export const selectUsers = (state: RootState) => state.admin.users;
export const selectFestivals = (state: RootState) => state.admin.festivals;
export const selectLoading = (state: RootState) => state.admin.loading;
export const selectError = (state: RootState) => state.admin.error;
export const selectSelectedUser = (state: RootState) => state.admin.selectedUser;
export const selectSelectedFestival = (state: RootState) => state.admin.selectedFestival;

export default adminSlice.reducer; 
import { RootState } from '../store';

interface User {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface Festival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'completed';
}

interface AdminState {
  users: User[];
  festivals: Festival[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  selectedFestival: Festival | null;
}

const initialState: AdminState = {
  users: [],
  festivals: [],
  loading: false,
  error: null,
  selectedUser: null,
  selectedFestival: null,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setFestivals: (state, action: PayloadAction<Festival[]>) => {
      state.festivals = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setSelectedFestival: (state, action: PayloadAction<Festival | null>) => {
      state.selectedFestival = action.payload;
    },
  },
});

export const {
  setUsers,
  setFestivals,
  setLoading,
  setError,
  setSelectedUser,
  setSelectedFestival,
} = adminSlice.actions;

export const selectUsers = (state: RootState) => state.admin.users;
export const selectFestivals = (state: RootState) => state.admin.festivals;
export const selectLoading = (state: RootState) => state.admin.loading;
export const selectError = (state: RootState) => state.admin.error;
export const selectSelectedUser = (state: RootState) => state.admin.selectedUser;
export const selectSelectedFestival = (state: RootState) => state.admin.selectedFestival;

export default adminSlice.reducer; 