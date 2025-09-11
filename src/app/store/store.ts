import { configureStore } from "@reduxjs/toolkit";
import fileDownloadReducer from "./slices/fileDownloadSlice";
import inventorySearchReducer from "./slices/inventorySearchSlice";

export const store = configureStore({
  reducer: {
    fileDownload: fileDownloadReducer,
    inventorySearch: inventorySearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
