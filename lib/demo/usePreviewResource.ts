"use client";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api";
export function usePreviewResource<T>(path: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    path: string;
    revision: number;
    data: T | null;
    error: string | null;
  }>({ path: "", revision: -1, data: null, error: null });
  useEffect(() => {
    let active = true;
    void apiFetch<T>(path)
      .then((data) => {
        if (active) setState({ path, revision, data, error: null });
      })
      .catch((error: unknown) => {
        if (active)
          setState({
            path,
            revision,
            data: null,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load the preview.",
          });
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  return {
    data: state.path === path ? state.data : null,
    error: state.path === path ? state.error : null,
    loading: state.path !== path || state.revision !== revision,
    refresh,
  };
}
