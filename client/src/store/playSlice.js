import { createSlice } from '@reduxjs/toolkit';

// State of the quiz the user is currently taking
const initialState = {
  quizId: null,
  currentIndex: 0, // which question is on screen
  answers: [], // answers[i] = option index the user chose for question i
  finished: false,
};

const playSlice = createSlice({
  name: 'play',
  initialState,
  reducers: {
    startQuiz(state, action) {
      return { ...initialState, quizId: action.payload };
    },
    // payload: { selected, total }
    submitAnswer(state, action) {
      const { selected, total } = action.payload;
      state.answers[state.currentIndex] = selected;
      if (state.currentIndex + 1 >= total) state.finished = true;
      else state.currentIndex += 1;
    },
    restartQuiz(state) {
      return { ...initialState, quizId: state.quizId };
    },
  },
});

// Score = number of answers equal to correctAnswerIndex
export const computeScore = (questions, answers) =>
  questions.reduce((score, q, i) => (answers[i] === q.correctAnswerIndex ? score + 1 : score), 0);

export const { startQuiz, submitAnswer, restartQuiz } = playSlice.actions;
export default playSlice.reducer;
