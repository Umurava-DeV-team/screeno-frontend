"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import DataTable from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import PreviewResourceState from "@/components/PreviewResourceState";
import { usePreviewResource } from "@/lib/demo/usePreviewResource";
import type { DemoAssessment, DemoAssignment } from "@/lib/demo/types";
export default function AssessmentDetailsPage() {
  const { id } = useParams();
  const resource = usePreviewResource<DemoAssessment>(
    "/assessments/" + String(id),
  );
  const assignments = usePreviewResource<DemoAssignment[]>(
    "/assessments/" + String(id) + "/assignments",
  );
  if (
    resource.loading ||
    assignments.loading ||
    !resource.data ||
    !assignments.data
  )
    return (
      <PreviewResourceState
        loading={resource.loading || assignments.loading}
        error={resource.error || assignments.error}
      />
    );
  const assessment = resource.data,
    rows = assignments.data;
  const columns: Column<DemoAssignment>[] = [
    { header: "Candidate", accessor: "candidateName" },
    { header: "Status", accessor: "status" },
    {
      header: "Local sample score",
      accessor: (a) =>
        a.status === "evaluated"
          ? a.percentage + "%"
          : "Awaiting submission/review",
    },
    {
      header: "Details",
      accessor: (a) => (
        <Link
          className="inline-flex items-center gap-1 text-brand"
          href={
            "/recruiter/assessments/" +
            assessment.id +
            "/submission/" +
            a.candidateId
          }
        >
          View response <ArrowUpRight size={13} />
        </Link>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <Link
        href="/recruiter/assessments/drafts"
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Assessments
      </Link>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="ts-eyebrow text-brand">
            {assessment.status} assessment · frontend preview
          </p>
          <h1 className="mt-2 text-3xl">{assessment.title}</h1>
          <p className="mt-3 text-xs text-slate-500">
            {assessment.totalQuestions} questions · {assessment.durationMinutes}{" "}
            minutes · {assessment.passingScore}% sample passing threshold
          </p>
        </div>
        {assessment.status === "draft" && (
          <Link
            href={"/recruiter/assessments/edit/" + assessment.id}
            className="ts-button"
          >
            Edit draft <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Sample assignments"
          value={String(rows.length)}
          icon={Users}
        />
        <MetricCard
          label="In progress"
          value={String(rows.filter((a) => a.status === "in_progress").length)}
          icon={Clock}
        />
        <MetricCard
          label="Submitted or evaluated"
          value={String(
            rows.filter((a) => ["submitted", "evaluated"].includes(a.status))
              .length,
          )}
          icon={CheckCircle2}
        />
      </div>
      <section className="ts-panel p-6">
        <h2 className="text-sm font-semibold">Instructions</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {assessment.instructions}
        </p>
      </section>
      <DataTable title="Candidate responses" columns={columns} data={rows} />
    </div>
  );
}
