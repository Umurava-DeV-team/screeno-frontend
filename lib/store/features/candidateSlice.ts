import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

export interface ApiCandidate {
  _id: string;
  name: string;
  email: string;
  currentRole: string;
  location: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
  jobId?: string;
  jobApplied?: string;
  resumeText?: string;
  createdAt?: string;
}

interface CandidateState {
  candidates: ApiCandidate[];
  loading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  candidates: [],
  loading: false,
  error: null,
};

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchAll',
  async (jobId: string | undefined, { rejectWithValue }) => {
    try {
      const url = jobId ? `/candidates?jobId=${jobId}` : '/candidates';
      return await apiFetch<ApiCandidate[]>(url);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch candidates');
    }
  }
);

export const createCandidate = createAsyncThunk(
  'candidates/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiCandidate>('/candidates', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create candidate');
    }
  }
);

export const updateCandidate = createAsyncThunk(
  'candidates/update',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiCandidate>(`/candidates/${id}`, {
        method: 'PATCH',
        body: formData,
        headers: {},
      });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update candidate');
    }
  }
);

export const deleteCandidate = createAsyncThunk(
  'candidates/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/candidates/${id}`, { method: 'DELETE' });
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete candidate');
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    clearCandidateError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates.unshift(action.payload);
      })
      .addCase(createCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.candidates.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.candidates[index] = action.payload;
        }
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = state.candidates.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCandidateError } = candidateSlice.actions;
export default candidateSlice.reducer;
