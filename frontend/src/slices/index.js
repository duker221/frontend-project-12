import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import channelsReducer from './channelsSlice.js';
import messageReducer from './messageSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    channels: channelsReducer,
    message: messageReducer,
  },
});
