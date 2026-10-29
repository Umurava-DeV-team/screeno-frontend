import Link from "next/link";
import { FileUp, ArrowRight } from "lucide-react";
export default function CandidateUploadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="ts-eyebrow text-brand">Candidate intake</p>
        <h1 className="mt-2 text-3xl">Bring your talent pool together.</h1>
        <p className="mt-3 text-sm text-slate-500">
          Review the import experience before connecting parsing and storage
          services.
        </p>
      </div>
      <section className="ts-panel p-8">
        <FileUp size={30} className="text-brand" />
        <h2 className="mt-5 text-xl font-semibold">
          Bulk import is not connected.
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
          No CSV, PDF or spreadsheet is uploaded, parsed, or sent anywhere in
          frontend preview mode. Add a fictional candidate manually to review a
          complete local workflow instead.
        </p>
        <Link href="/recruiter/candidates/new" className="ts-button mt-6">
          Add a sample candidate <ArrowRight size={15} />
        </Link>
        <p className="mt-6 text-xs leading-6 text-slate-400">
          The production import flow will need validation, a column-mapping
          preview, duplicate handling, row-level errors and explicit
          confirmation before saving.
        </p>
      </section>
    </div>
  );
}
