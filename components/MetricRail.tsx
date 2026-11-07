import type { LucideIcon } from "lucide-react";
import MetricCard from "./MetricCard";

export type WorkspaceMetric = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  hint?: string;
};

export default function MetricRail({ metrics, loading = false }: { metrics: WorkspaceMetric[]; loading?: boolean }) {
  return <section className="workspace-metric-rail" aria-label="Page metrics" aria-busy={loading}>
    {metrics.map(metric => <MetricCard key={metric.label} {...metric} value={loading ? "…" : String(metric.value)} />)}
  </section>;
}
