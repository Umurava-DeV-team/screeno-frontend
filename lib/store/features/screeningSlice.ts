import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { DemoAssessment } from "../../demo/types";
import { apiFetch } from "@/lib/api";

export interface ScreeningMatch {
  candidateId: string;
  name: string;
  email: string;
  matchScore: number;
  strengths: string[];
  missingSkills: string[];
  risks: string[];
  summary: string;
}

export interface ScreeningResult {
  id: string;
  _id: string;
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  shortlist: ScreeningMatch[];
  screenedAt: string;
}

interface ScreeningState {
  recentScreening: ScreeningResult | null;
  history: ScreeningResult[];
  loading: boolean;
  error: string | null;
}

const initialState: ScreeningState = {
  recentScreening: null,
  history: [],
  loading: false,
  error: null,
};

export const runScreening = createAsyncThunk(
  "screening/run",
  async (
    { jobId, topN }: { jobId: string; topN: number },
    { rejectWithValue },
  ) => {
    try {
      const result = await apiFetch<ScreeningResult>("/screening/run", {
        method: "POST",
        body: JSON.stringify({ jobId, topN }),
      });
      return result;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to run screening",
      );
    }
  },
);

export const createAssessmentDraft = createAsyncThunk(
  "screening/createAssessment",
  async ({ jobId }: { jobId: string }, { rejectWithValue }) => {
    try {
      return await apiFetch<DemoAssessment>("/screening/create-assessment", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : "Failed to create assessment draft",
      );
    }
  },
);
export const fetchScreeningHistory = createAsyncThunk(
  "screening/fetchHistory",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const url =
        jobId === "all" ? "/screening/all" : `/screening/history/${jobId}`;
      return await apiFetch<ScreeningResult[]>(url);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : "Failed to fetch screening history",
      );
    }
  },
);

const screeningSlice = createSlice({
  name: "screening",
  initialState,
  reducers: {
    clearScreeningError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runScreening.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.recentScreening = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(runScreening.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAssessmentDraft.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchScreeningHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchScreeningHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
        if (action.payload.length > 0) {
          state.recentScreening = action.payload[0];
        }
      })
      .addCase(fetchScreeningHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearScreeningError } = screeningSlice.actions;
export default screeningSlice.reducer;
