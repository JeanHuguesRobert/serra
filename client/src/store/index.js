import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    chat: chatReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

if (process.env.NODE_ENV === 'development') {
  window.store = store;
}