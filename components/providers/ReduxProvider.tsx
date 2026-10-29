"use client";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { makeStore } from "@/lib/store/store";
import { fetchMe } from "@/lib/store/features/authSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  // Keep streamed boundaries on the SSR snapshot while the preview session restores.
  const [serverState] = useState(() => store.getState());
  useEffect(() => {
    void store.dispatch(fetchMe());
  }, [store]);
  return (
    <Provider store={store} serverState={serverState}>
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
