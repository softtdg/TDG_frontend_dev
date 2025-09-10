import { AxiosInstance } from "@/app/services/axiosInterface";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
interface FileDownloadState {
  // loading: boolean;
  // blankLoading: boolean,
  // itemLoading: { [key: string]: boolean },
  error: string | null;
  success: boolean;
  filename: string | null;
}

interface DownloadPayload {
  fixtureNumber: string;
  user: string;
}

interface DownloadItemPayload {
  SOPLeadHandEntryId: string;
  user: string;
  fixtureNumber: string;
}

// Initial state
const initialState: FileDownloadState = {
  // loading: false,
  // blankLoading: false,
  // itemLoading: {},
  error: null,
  success: false,
  filename: null,
};

function getFileNameFromHeader(disposition: any) {
  if (!disposition) return null;
  const match = disposition.match(/filename="(.+)"/);
  return match ? match[1] : null;
}

const today = new Date();
const formattedDate = today
  .toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })
  .replace(",", "")
  .replace(" ", "-");

// Async thunk for downloading blank pick list file
export const downloadPickListFile = createAsyncThunk(
  "fileDownload/downloadPickList",
  async (payload: DownloadPayload, { rejectWithValue }) => {
    try {
      // Use the working downloadPickList endpoint
      const url = `/sopSearch/downloadPickList?fixture=${payload.fixtureNumber}&user=${payload.user}`;

      const response = await AxiosInstance.get(url, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
        },
        responseType: "blob",
      });

      const blob = response.data;
      const disposition = response.headers["content-disposition"];

      // Extract filename from header or use default
      const filename = getFileNameFromHeader(disposition);

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      return { filename };
    } catch (error: any) {
      // console.error('Redux: Download error:', error);
      return rejectWithValue(error.message || "Failed to download file");
    }
  }
);

// Async thunk for downloading individual item file
export const downloadItemPickListFile = createAsyncThunk(
  "fileDownload/downloadItemPickList",
  async (payload: DownloadItemPayload, { rejectWithValue }) => {
    try {
      // Use the same downloadPickList endpoint but with lhrEntryId parameter
      const url = `/sopSearch/downloadPickList?lhrEntryId=${payload.SOPLeadHandEntryId}&user=${payload.user}`;

      const response = await AxiosInstance.get(url, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
        },
        responseType: "blob",
      });

      const blob = response.data;
      const disposition = response.headers["content-disposition"];

      // Extract filename from header or use default
      let filename = getFileNameFromHeader(disposition);
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      return { filename };
    } catch (error: any) {
      // console.error('Redux: Download error:', error);
      return rejectWithValue(error.message || "Failed to download file");
    }
  }
);

// Slice
const fileDownloadSlice = createSlice({
  name: "fileDownload",
  initialState,
  reducers: {
    resetDownloadState: (state) => {
      // state.loading = false;
      // state.blankLoading = false;
      // state.itemLoading = {};
      state.error = null;
      state.success = false;
      state.filename = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Blank Pick List Download - Pending
      .addCase(downloadPickListFile.pending, (state) => {
        // state.loading = true;
        // state.blankLoading = true;
        state.error = null;
        state.success = false;
        state.filename = null;
      })
      // Blank Pick List Download - Fulfilled
      .addCase(
        downloadPickListFile.fulfilled,
        (state, action: PayloadAction<{ filename: string }>) => {
          // state.loading = false;
          // state.blankLoading = false;
          state.success = true;
          state.filename = action.payload.filename;
          state.error = null;
        }
      )
      // Blank Pick List Download - Rejected
      .addCase(downloadPickListFile.rejected, (state, action) => {
        // state.loading = false;
        // state.blankLoading = false;
        state.error = action.payload as string;
        state.success = false;
        state.filename = null;
      })
      // Item Pick List Download - Pending
      .addCase(downloadItemPickListFile.pending, (state, action) => {
        // state.loading = true;
        // state.itemLoading = true;
        // const { SOPLeadHandEntryId } = action.meta.arg as DownloadItemPayload;
        // state.itemLoading[SOPLeadHandEntryId] = true;
        state.error = null;
        state.success = false;
        state.filename = null;
      })
      // Item Pick List Download - Fulfilled
      .addCase(downloadItemPickListFile.fulfilled, (state, action) => {
        // state.loading = false;
        // state.itemLoading = false;
        // const { SOPLeadHandEntryId } = action.meta.arg as DownloadItemPayload;
        // state.itemLoading[SOPLeadHandEntryId] = false;
        state.success = true;
        state.filename = action.payload.filename;
        state.error = null;
      })
      // Item Pick List Download - Rejected
      .addCase(downloadItemPickListFile.rejected, (state, action) => {
        // state.loading = false;
        // state.itemLoading = false;
        // const { SOPLeadHandEntryId } = action.meta.arg as DownloadItemPayload;
        // state.itemLoading[SOPLeadHandEntryId] = false;
        state.error = action.payload as string;
        state.success = false;
        state.filename = null;
      });
  },
});

export const { resetDownloadState, clearError } = fileDownloadSlice.actions;
export default fileDownloadSlice.reducer;
