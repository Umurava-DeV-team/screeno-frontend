import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import authReducer, { enterPreviewSession, logout } from "./features/authSlice";
import recruiterReducer from "./features/recruiterSlice";
import candidateReducer from "./features/candidateSlice";
import jobsReducer from "./features/jobsSlice";
import screeningReducer from "./features/screeningSlice";
import assessmentReducer from "./features/assessmentSlice";
import applicationReducer from "./features/applicationSlice";
import profileReducer from "./features/profileSlice";
import notificationsReducer from "./features/notificationsSlice";
import { endDemoSession } from "../demo/store";

const appReducer = combineReducers({
  auth: authReducer,
  recruiter: recruiterReducer,
  candidate: candidateReducer,
  jobs: jobsReducer,
  screening: screeningReducer,
  assessments: assessmentReducer,
  application: applicationReducer,
  profile: profileReducer,
  notifications: notificationsReducer,
});
export type RootState = ReturnType<typeof appReducer>;
function rootReducer(state: RootState | undefined, action: UnknownAction) {
  if (
    logout.match(action) ||
    (enterPreviewSession.fulfilled.match(action) &&
      state?.auth.role !== action.payload.role)
  )
    state = undefined;
  return appReducer(state, action);
}
const previewLifecycle: Middleware = () => (next) => (action) => {
  if (logout.match(action) && typeof window !== "undefined") endDemoSession();
  return next(action);
};
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().concat(previewLifecycle),
  });
export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
