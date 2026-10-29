import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

export interface ApiAssessment {
  id: string;
  _id?: string;
  jobId: any;
  candidateId?: any;
  talentId?: any;
  status: string;
  answers: any[];
  timeTakenMinutes: number;
  sessionStatus: string;
  sessionIntegrity: number;
  percentage?: number;
  passed?: boolean;
  evaluatedAnswers?: any[];
  createdAt: string;
}

interface AssessmentState {
  assessments: ApiAssessment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  assessments: [],
  loading: false,
  error: null,
};

export const fetchAssessments = createAsyncThunk(
  'assessments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiFetch<ApiAssessment[]>('/assessments');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch assessments');
    }
  }
);

export const fetchMyAssessments = createAsyncThunk(
  'assessments/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiFetch<ApiAssessment[]>('/assessments/my');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch my assessments');
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchMyAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default assessmentSlice.reducer;
