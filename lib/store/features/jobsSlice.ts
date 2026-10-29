import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

export interface ApiJob {
  id?: string;
  _id: string;
  title: string;
  company: string;
  department: string;
  experienceLevel: string;
  applicantsTarget: number;
  location: string;
  salaryRange: string;
  description?: string;
  descriptionFileUrl?: string;
  applicantCount?: number;
  status?: "active" | "draft" | "closed" | "archived";
  createdAt?: string;
}


interface JobsState {
  jobs: ApiJob[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  loading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch<ApiJob[]>('/jobs');
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch jobs');
  }
});

export const createJob = createAsyncThunk(
  'jobs/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiJob>('/jobs', { method: 'POST', body: formData, headers: {} });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create job');
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/update',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiJob>(`/jobs/${id}`, { method: 'PATCH', body: formData, headers: {}});
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update job');
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/jobs/${id}`, { method: 'DELETE' });
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete job');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearJobsError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => { state.loading = false; state.jobs = action.payload; })
      .addCase(fetchJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(createJob.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createJob.fulfilled, (state, action) => { state.loading = false; state.jobs.unshift(action.payload); })
      .addCase(createJob.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(updateJob.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.jobs.findIndex(j => j._id === action.payload._id);
        if (idx !== -1) state.jobs[idx] = action.payload;
      })
      .addCase(updateJob.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(deleteJob.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.filter(j => j._id !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearJobsError } = jobsSlice.actions;
export default jobsSlice.reducer;
