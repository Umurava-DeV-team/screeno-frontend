"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
export default function CompletePage() {
  const { token } = useParams();
  return (
    <div className="ts-panel mx-auto max-w-xl space-y-5 p-8 text-center">
      <CheckCircle2 size={32} className="mx-auto text-brand" />
      <h1 className="text-2xl">Review your sample session.</h1>
      <p className="text-sm leading-7 text-slate-500">
        Responses are stored locally in this browser. No confirmation email is
        sent. Open the saved result to check its actual submission status.
      </p>
      <Link
        href={"/candidate/assessments/" + String(token) + "/results"}
        className="ts-button"
      >
        View local results
      </Link>
    </div>
  );
}
