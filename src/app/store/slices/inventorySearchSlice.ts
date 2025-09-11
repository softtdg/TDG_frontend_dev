import { AxiosInstance } from "@/app/services/axiosInterface";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
interface InventorySearchState {
  loading: boolean;
  error: string | null;
  searchResults: any[];
  hasSearched: boolean;
}

interface InventorySearchPayload {
  partNumber: string;
}

// Initial state
const initialState: InventorySearchState = {
  loading: false,
  error: null,
  searchResults: [],
  hasSearched: false,
};

// Async thunk for inventory search
export const searchInventory = createAsyncThunk(
  "inventorySearch/searchInventory",
  async (payload: InventorySearchPayload, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        `/partInventory/${payload.partNumber}`
      );

      return response.data;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to search inventory"
      );
    }
  }
);

// Slice
const inventorySearchSlice = createSlice({
  name: "inventorySearch",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.hasSearched = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSearchState: (state) => {
      state.loading = false;
      state.error = null;
      state.searchResults = [];
      state.hasSearched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Inventory - Pending
      .addCase(searchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.hasSearched = true;
      })
      // Search Inventory - Fulfilled
      .addCase(searchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload || [];
        state.error = null;
      })
      // Search Inventory - Rejected
      .addCase(searchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.searchResults = [];
      });
  },
});

export const { clearSearchResults, clearError, resetSearchState } =
  inventorySearchSlice.actions;
export default inventorySearchSlice.reducer;
