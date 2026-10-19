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

// GET /api/questions
export const fetchQuestions = thunk('questions/fetchAll', async () => (await api.get('/questions')).data);
// POST /api/questions   { text, options, keywords, correctAnswerIndex }   (Admin)
export const createQuestion = thunk(
  'questions/create',
  async (question) => (await api.post('/questions', question)).data
);
// PUT /api/questions/:id   (Admin)
export const updateQuestion = thunk(
  'questions/update',
  async ({ id, ...question }) => (await api.put(`/questions/${id}`, question)).data
);
// DELETE /api/questions/:id   (Admin)
export const deleteQuestion = thunk('questions/delete', async (id) => {
  await api.delete(`/questions/${id}`);
  return id;
});

const questionSlice = createSlice({
  name: 'questions',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    clearQuestionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const i = state.items.findIndex((q) => q._id === action.payload._id);
        if (i !== -1) state.items[i] = action.payload;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q._id !== action.payload);
        state.error = null;
      })
      .addMatcher(
        (action) => /^questions\/(create|update|delete)\/rejected$/.test(action.type),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearQuestionError } = questionSlice.actions;
export default questionSlice.reducer;
