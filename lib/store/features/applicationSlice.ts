import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";

export interface ApiApplication {
  _id: string;
  candidateId: string | any;
  jobId: string | any;
  status: string;
  createdAt: string;
}

interface ApplicationState {
  myApplications: ApiApplication[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  myApplications: [],
  loading: false,
  error: null,
};

export const applyToJob = createAsyncThunk(
  "applications/apply",
  async (jobId: string, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiApplication>("/applications", {
        method: "POST",
        body: JSON.stringify({ jobId: jobId.toString() }),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchMyApplications = createAsyncThunk(
  "applications/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiApplication[]>("/applications/my");
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearAppError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyToJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications.unshift(action.payload);
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.myApplications = action.payload;
      });
  },
});

export const { clearAppError } = applicationSlice.actions;
export default applicationSlice.reducer;
