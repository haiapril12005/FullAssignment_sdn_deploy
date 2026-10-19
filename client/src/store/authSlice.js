import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { errorMessage, TOKEN_KEY, USER_KEY } from '../api/client';

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// POST /api/users/login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/users/login', credentials);
    saveSession(data);
    return data;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

// POST /api/users/signup  (logs the new user in right away)
export const register = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/users/signup', credentials);
    saveSession(data);
    return data;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

// GET /api/users/me  (checks that the saved token is still valid when the app starts)
export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/me');
    return data.user;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem(TOKEN_KEY),
    user: loadUser(),
    status: 'idle', // idle | loading | failed
    error: null,
  },
  reducers: {
    logout(state) {
      clearSession();
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const fulfilled = (state, action) => {
      state.status = 'idle';
      state.token = action.payload.token;
      state.user = action.payload.user;
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Request failed';
    };
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
