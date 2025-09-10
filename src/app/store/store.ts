import { configureStore } from '@reduxjs/toolkit';
import fileDownloadReducer from './slices/fileDownloadSlice';

export const store = configureStore({
  reducer: {
    fileDownload: fileDownloadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 