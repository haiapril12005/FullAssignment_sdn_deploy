import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './authSlice';
import quizReducer from './quizSlice';
import questionReducer from './questionSlice';
import playReducer from './playSlice';

const appReducer = combineReducers({
  auth: authReducer,
  quizzes: quizReducer,
  questions: questionReducer,
  play: playReducer,
});

// On logout, reset every slice so the next user starts with a clean state
const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    return appReducer({ auth: undefined }, action);
  }
  return appReducer(state, action);
};

const store = configureStore({ reducer: rootReducer });

export default store;
