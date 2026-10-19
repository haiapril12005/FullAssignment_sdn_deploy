import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { errorMessage } from '../api/client';

const thunk = (type, request) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await request(arg);
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  });

// GET /api/quizzes  (questions are populated by the backend)
export const fetchQuizzes = thunk('quizzes/fetchAll', async () => (await api.get('/quizzes')).data);
// POST /api/quizzes   { title, description, questions: [ids] }
export const createQuiz = thunk('quizzes/create', async (quiz) => (await api.post('/quizzes', quiz)).data);
// PUT /api/quizzes/:id
export const updateQuiz = thunk(
  'quizzes/update',
  async ({ id, ...quiz }) => (await api.put(`/quizzes/${id}`, quiz)).data
);
// DELETE /api/quizzes/:id
export const deleteQuiz = thunk('quizzes/delete', async (id) => {
  await api.delete(`/quizzes/${id}`);
  return id;
});

const quizSlice = createSlice({
  name: 'quizzes',
  initialState: { items: [], status: 'idle', error: null }, // status: idle | loading | succeeded | failed
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const i = state.items.findIndex((q) => q._id === action.payload._id);
        if (i !== -1) state.items[i] = action.payload;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q._id !== action.payload);
        state.error = null;
      })
      .addMatcher(
        (action) => /^quizzes\/(create|update|delete)\/rejected$/.test(action.type),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export default quizSlice.reducer;
