import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiRequestError, fetchUserById, fetchUsers } from '../../services';
import type { User } from '../../types';
import type { RootState } from '../index';

const DEFAULT_LIMIT = 5;

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type UsersState = {
  users: User[];
  page: number;
  limit: number;
  hasMore: boolean;
  status: RequestStatus;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  searchQuery: string;
  selectedUser: User | null;
  selectedUserStatus: RequestStatus;
  selectedUserError: string | null;
};

const initialState: UsersState = {
  users: [],
  page: 0,
  limit: DEFAULT_LIMIT,
  hasMore: true,
  status: 'idle',
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  searchQuery: '',
  selectedUser: null,
  selectedUserStatus: 'idle',
  selectedUserError: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function mergeUsers(existing: User[], incoming: User[]): User[] {
  const seen = new Set(existing.map(user => user.id));
  const next = [...existing];

  incoming.forEach(user => {
    if (!seen.has(user.id)) {
      seen.add(user.id);
      next.push(user);
    }
  });

  return next;
}

export const loadUsers = createAsyncThunk<
  Awaited<ReturnType<typeof fetchUsers>>,
  void,
  { state: RootState; rejectValue: string }
>('users/loadUsers', async (_, thunkAPI) => {
  try {
    const limit = thunkAPI.getState().users.limit;
    return await fetchUsers({ page: 1, limit, signal: thunkAPI.signal });
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, 'Unable to load users.'),
    );
  }
});

export const loadMoreUsers = createAsyncThunk<
  Awaited<ReturnType<typeof fetchUsers>>,
  void,
  { state: RootState; rejectValue: string }
>(
  'users/loadMoreUsers',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState().users;
      return await fetchUsers({
        page: state.page + 1,
        limit: state.limit,
        signal: thunkAPI.signal,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, 'Unable to load more users.'),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState().users;
      return !state.isLoadingMore && !state.isRefreshing && state.hasMore;
    },
  },
);

export const refreshUsers = createAsyncThunk<
  Awaited<ReturnType<typeof fetchUsers>>,
  void,
  { state: RootState; rejectValue: string }
>(
  'users/refreshUsers',
  async (_, thunkAPI) => {
    try {
      const limit = thunkAPI.getState().users.limit;
      return await fetchUsers({ page: 1, limit, signal: thunkAPI.signal });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, 'Unable to refresh users.'),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState().users;
      return !state.isRefreshing;
    },
  },
);

export const loadUserDetail = createAsyncThunk<
  User,
  number,
  { rejectValue: string }
>('users/loadUserDetail', async (userId, thunkAPI) => {
  try {
    return await fetchUserById(userId, thunkAPI.signal);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, 'Unable to load user details.'),
    );
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSelectedUser: state => {
      state.selectedUser = null;
      state.selectedUserStatus = 'idle';
      state.selectedUserError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadUsers.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.users;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Unknown error';
      })
      .addCase(loadMoreUsers.pending, state => {
        state.isLoadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreUsers.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        state.users = mergeUsers(state.users, action.payload.users);
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(loadMoreUsers.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload || action.error.message || 'Unknown error';
      })
      .addCase(refreshUsers.pending, state => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshUsers.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.users = action.payload.users;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(refreshUsers.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload || action.error.message || 'Unknown error';
      })
      .addCase(loadUserDetail.pending, state => {
        state.selectedUserStatus = 'loading';
        state.selectedUserError = null;
      })
      .addCase(loadUserDetail.fulfilled, (state, action) => {
        state.selectedUserStatus = 'succeeded';
        state.selectedUser = action.payload;

        const existingIndex = state.users.findIndex(
          user => user.id === action.payload.id,
        );
        if (existingIndex >= 0) {
          state.users[existingIndex] = action.payload;
        } else {
          state.users.push(action.payload);
        }
      })
      .addCase(loadUserDetail.rejected, (state, action) => {
        state.selectedUserStatus = 'failed';
        state.selectedUserError =
          action.payload || action.error.message || 'Unknown error';
      });
  },
});

export const { clearSelectedUser, setSearchQuery } = usersSlice.actions;

export const selectUsersState = (state: RootState) => state.users;
export const selectUsers = (state: RootState) => state.users.users;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectHasMoreUsers = (state: RootState) => state.users.hasMore;
export const selectIsLoadingMoreUsers = (state: RootState) =>
  state.users.isLoadingMore;
export const selectIsRefreshingUsers = (state: RootState) =>
  state.users.isRefreshing;
export const selectUsersSearchQuery = (state: RootState) =>
  state.users.searchQuery;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectSelectedUserStatus = (state: RootState) =>
  state.users.selectedUserStatus;
export const selectSelectedUserError = (state: RootState) =>
  state.users.selectedUserError;

export const selectFilteredUsers = (state: RootState) => {
  const query = state.users.searchQuery.trim().toLowerCase();
  if (!query) {
    return state.users.users;
  }

  return state.users.users.filter(user =>
    user.name.toLowerCase().includes(query),
  );
};

export const selectUserById = (state: RootState, userId: number) =>
  state.users.users.find(user => user.id === userId);

export default usersSlice.reducer;
