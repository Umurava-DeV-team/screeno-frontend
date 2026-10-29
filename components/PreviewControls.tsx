"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FlaskConical, RotateCcw, X } from "lucide-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { enterPreviewSession, logout } from "@/lib/store/features/authSlice";
import { resetDemoDatabase } from "@/lib/demo/store";
import type { DemoRole } from "@/lib/demo/types";
export default function PreviewControls() {
    const [expanded, setExpanded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    if (pathname === "/" || pathname === "/opportunities" || pathname?.startsWith("/auth") || pathname === "/loading")
        return null;
    async function open(role: DemoRole) {
        setBusy(true);
        setError("");
        const result = await dispatch(enterPreviewSession(role));
        setBusy(false);
        if (enterPreviewSession.fulfilled.match(result)) {
            router.push("/" + role + "/dashboard");
            setExpanded(false);
        }
        else
            setError(String(result.payload));
    }
    function reset() {
        if (!window.confirm("Reset only this browser’s Screeno sample data? Your preview edits will be removed."))
            return;
        resetDemoDatabase();
        dispatch(logout());
        window.location.assign("/auth");
    }
    return (<aside className="fixed bottom-3 right-3 z-[90] max-w-[calc(100vw-24px)] rounded-lg border border-brand/20 bg-white shadow-lg print:hidden" aria-label="Frontend preview controls">
      {expanded && (<div className="w-[300px] max-w-full border-b border-[#e3e8dc] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">
              Frontend review workspace
            </h2>
            <button onClick={() => setExpanded(false)} aria-label="Close preview controls" className="p-1">
              <X size={15}/>
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Fictional records only. No backend, AI, email, microphone or camera
            connection. Preview edits stay in this browser. Do not enter real
            credentials or candidate data.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button disabled={busy} onClick={() => open("recruiter")} className="ts-button !px-2 !py-2 !text-xs">
              Recruiter demo
            </button>
            <button disabled={busy} onClick={() => open("candidate")} className="ts-button secondary !px-2 !py-2 !text-xs">
              Candidate demo
            </button>
          </div>
          {error && (<p role="alert" className="mt-3 text-xs text-red-600">
              {error}
            </p>)}
          <button onClick={reset} disabled={busy} className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <RotateCcw size={12}/>
            Reset sample data
          </button>
        </div>)}
      <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="flex items-center gap-2 px-3 py-2.5 text-[10px] font-medium text-brand">
        <FlaskConical size={13}/>
        <span>Frontend preview · Backend disconnected</span>
      </button>
    </aside>);
}
