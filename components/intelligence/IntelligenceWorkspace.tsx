"use client";
import {hiringTools} from "@/lib/hiringTools";
import CustomSelect from "@/components/CustomSelect";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  FileSearch,
  MessagesSquare,
  FlaskConical,
  Workflow,
  Route,
  ShieldCheck,
  ChartNoAxesCombined,
  SearchCheck,
  BadgeCheck,
  Languages,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { IntelligenceSnapshot } from "@/lib/intelligence/types";
import { translate } from "@/lib/intelligence/locale";
import { defaultPreferences } from "@/lib/intelligence/seed";
import {
  EvidencePanel,
  ScreeningPanel,
  SimulationsPanel,
} from "./EvidenceAndAssessment";
import { WorkflowPanel, JourneyPanel, RoiPanel } from "./RecruitmentOperations";
import {
  AuditPanel,
  RediscoveryPanel,
  VerificationPanel,
  InclusionPanel,
} from "./TrustAndAccess";
import { Badge, Empty } from "./shared";
const modules = [
  {
    id: "evidence",
    icon: FileSearch,
    description:
      "See the work behind a claim. Review sources, evidence gaps and candidate corrections.",
    candidate: true,
  },
  {
    id: "screening",
    icon: MessagesSquare,
    description:
      "Competency-led conversations with clarifying follow-ups and human rubric review.",
    candidate: true,
  },
  {
    id: "simulations",
    icon: FlaskConical,
    description:
      "Realistic developer, support, sales and analyst tasks. Judge the work against clear criteria.",
    candidate: true,
  },
  {
    id: "workflows",
    icon: Workflow,
    description:
      "Prepare campaign actions, approve sensitive steps and keep a record of every decision.",
    candidate: false,
  },
  {
    id: "journey",
    icon: Route,
    description:
      "Application stages, next steps, update expectations and candidate preparation.",
    candidate: true,
  },
  {
    id: "audit",
    icon: ShieldCheck,
    description:
      "Identity masking, corrections, overrides and aggregate investigation controls.",
    candidate: false,
  },
  {
    id: "roi",
    icon: ChartNoAxesCombined,
    description:
      "Recorded costs, screening time, completion and stage outcomes with visible limitations.",
    candidate: false,
  },
  {
    id: "rediscovery",
    icon: SearchCheck,
    description:
      "Find relevant talent with current discovery consent and controlled outreach.",
    candidate: true,
  },
  {
    id: "verification",
    icon: BadgeCheck,
    description:
      "Consent-led credential requests and clarification. Separate unchecked from verified.",
    candidate: true,
  },
  {
    id: "inclusion",
    icon: Languages,
    description:
      "English, French and Kinyarwanda preview copy, text alternatives and saved accessibility choices.",
    candidate: true,
  },
] as const;
export default function IntelligenceWorkspace({
  role,
  module,
}: {
  role: "recruiter" | "candidate";
  module?: string;
}) {
  const [data, setData] = useState<IntelligenceSnapshot | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void apiFetch<IntelligenceSnapshot>("/intelligence")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((e: unknown) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "Unable to load this workspace.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const perform = useCallback(
    async (action: string, input: Record<string, unknown>) => {
      setBusy(true);
      setError("");
      setNotice("");
      try {
        const next = await apiFetch<IntelligenceSnapshot>(
          "/intelligence/" + action,
          { method: "POST", body: JSON.stringify(input) },
        );
        setData(next);
        setNotice(
          translate(next.preferences[next.userId]?.locale || "en", "saved"),
        );
        return true;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to save this action.",
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  if (!data)
    return (
      <div className="ts-panel p-8" role={error ? "alert" : "status"}>
        {error || "Loading your local intelligence workspace…"}
      </div>
    );
  const prefs = data.preferences[data.userId] || defaultPreferences();
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(prefs.locale, key);
  const root =
    role === "recruiter" ? "/recruiter/intelligence" : "/candidate/experience";
  const available = modules.filter((m) => role === "recruiter" || m.candidate);
  const selected = available.find((m) => m.id === module);
  const context = { data, perform, busy, t };
  const views = {
    evidence: EvidencePanel,
    screening: ScreeningPanel,
    simulations: SimulationsPanel,
    workflows: WorkflowPanel,
    journey: JourneyPanel,
    audit: AuditPanel,
    roi: RoiPanel,
    rediscovery: RediscoveryPanel,
    verification: VerificationPanel,
    inclusion: InclusionPanel,
  };
  const View = selected ? views[selected.id] : null;
  return (
    <div
      className="feature-workspace space-y-6 pb-16"
      lang={prefs.locale}
      data-large-text={prefs.largeText}
      data-low-bandwidth={prefs.lowBandwidth}
    >
      <a href="#feature-content" className="sr-only focus:not-sr-only">
        Skip to feature content
      </a>
      {module && (
        <Link
          href={root}
          className="inline-flex items-center gap-2 text-xs text-slate-500"
        >
          <ArrowLeft size={14} />
          {t("back")}
        </Link>
      )}
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="ts-eyebrow text-brand">
            {role === "recruiter"
              ? "The evidence behind every decision"
              : "Your work. Your voice. Your next step."}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {selected ? (hiringTools.find(tool=>tool.id===selected.id)?.label || t(selected.id)) : "Hiring toolkit"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            {hiringTools.find(tool=>tool.id===selected?.id)?.description || selected?.description ||
              (role === "recruiter"
                ? "A connected workspace for better-supported decisions and a more thoughtful candidate experience."
                : "Understand your progress, show your skills and control how your information is used.")}
          </p>
        </div>
        <label className="block text-[10px] font-medium text-slate-500">
          {t("language")}
          <CustomSelect
            aria-label={t("language")}
            disabled={busy}
            value={prefs.locale}
            onChange={(e) =>
              void perform("preferences", { locale: e.target.value })
            }
            className="ts-auth-input mt-2 !w-40 !py-2"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="rw">Ikinyarwanda</option>
          </CustomSelect>
        </label>
      </header>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-brand/15 bg-white p-4">
        <Badge>Local preview</Badge>
        <p className="flex-1 text-xs leading-6 text-slate-500">
          {t("preview")}
        </p>
      </div>
      {module && (
        <nav
          aria-label="Hiring tools"
          className="flex flex-wrap gap-2"
        >
          {available.map((m) => (
            <Link
              key={m.id}
              href={root + "/" + m.id}
              aria-current={m.id === module ? "page" : undefined}
              className={
                "rounded border px-3 py-2 text-[11px] " +
                (m.id === module
                  ? "border-brand bg-brand text-white"
                  : "border-[#e1e6da] bg-white text-slate-500")
              }
            >
              {hiringTools.find(tool=>tool.id===m.id)?.label || t(m.id)}
            </Link>
          ))}
        </nav>
      )}
      {error && (
        <p
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-4 text-xs leading-6 text-red-700"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          aria-live="polite"
          className="rounded border border-lime/60 bg-lime/20 p-3 text-xs"
        >
          {notice}
        </p>
      )}
      <main id="feature-content" tabIndex={-1}>
        {!module ? (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Evidence records", data.evidence.length],
                [
                  "Work awaiting review",
                  data.screenings.filter((s) => s.status === "awaiting_review")
                    .length +
                    data.simulations.filter((s) => s.status === "submitted")
                      .length,
                ],
                [
                  "Active application journeys",
                  data.applications.filter(
                    (a) =>
                      !["hired", "rejected", "withdrawn"].includes(a.status),
                  ).length,
                ],
              ].map(([label, value]) => (
                <div key={label} className="ts-panel p-5">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-4 text-3xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {available.map((m, index) => (
                <Link
                  key={m.id}
                  href={root + "/" + m.id}
                  className="ts-panel group flex min-h-56 flex-col p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-md border border-brand/10 bg-brand/5 text-brand">
                      <m.icon size={19} strokeWidth={1.6} />
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-6 text-base font-semibold">{hiringTools.find(tool=>tool.id===m.id)?.label || t(m.id)}</h2>
                  <p className="mt-3 text-xs leading-6 text-slate-500">
                    {m.description}
                  </p>
                  <span className="mt-5 flex items-center justify-between text-xs font-medium text-brand">
                    Explore workflow <ArrowUpRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : View ? (
          <View key={module + data.userId} {...context} />
        ) : (
          <Empty text="This feature is not available in this workspace." />
        )}
      </main>
    </div>
  );
}
