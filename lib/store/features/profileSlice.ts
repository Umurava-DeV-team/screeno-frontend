import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';
import { logout } from './authSlice';

export interface ApiProfile {
  userId: string;
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  email?: string;
  location?: string;
  mobileNumber?: string;
  skills: any[];
  workExperience: any[];
  education: any[];
  certifications: any[];
  projects: any[];
  availabilityStatus?: string;
  employmentType?: string;
  availableStartDate?: string;
  linkedin?: string;
  github?: string;
  personalPortfolio?: string;
  resumeName?: string;
  resumeUrl?: string;
}

interface ProfileState {
  profile: ApiProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile');
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateBasicInfo = createAsyncThunk(
  'profile/updateBasic',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/basic-info', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addSkill = createAsyncThunk(
  'profile/addSkill',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/skills', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addWorkExperience = createAsyncThunk(
  'profile/addExp',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/work-experience', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addEducation = createAsyncThunk(
  'profile/addEdu',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/education', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const uploadResume = createAsyncThunk(
  'profile/uploadResume',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      return await apiFetch<ApiProfile>('/profile/resume', {
        method: 'POST',
        body: formData,
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'profile/updateAvail',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/availability', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSocialLinks = createAsyncThunk(
  'profile/updateSocial',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/social-links', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addCertification = createAsyncThunk(
  'profile/addCert',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/certifications', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addProject = createAsyncThunk(
  'profile/addProject',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<ApiProfile>('/profile/projects', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (dto: any, { rejectWithValue }) => {
    try {
      return await apiFetch<{ message: string }>('/profile/change-password', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout, (state) => {
        state.profile = null;
        state.error = null;
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && action.type.startsWith('profile/') && !action.type.includes('changePassword'),
        (state, action: PayloadAction<ApiProfile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('profile/'),
        (state) => {
          state.loading = true;
        }
      );
  },
});

export default profileSlice.reducer;

export const isProfileComplete = (profile: ApiProfile | null) => {
  if (!profile) return false;
  const hasBasicInfo = !!(profile.firstName && profile.lastName && profile.headline);
  const hasSkills = profile.skills && profile.skills.length > 0;
  const hasExperience = profile.workExperience && profile.workExperience.length > 0;
  const hasEducation = profile.education && profile.education.length > 0;
  
  return hasBasicInfo && hasSkills && hasExperience && hasEducation;
};
