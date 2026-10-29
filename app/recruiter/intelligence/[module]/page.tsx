"use client";
import { useParams } from "next/navigation";
import IntelligenceWorkspace from "@/components/intelligence/IntelligenceWorkspace";
export default function Page() {
  const { module } = useParams();
  return <IntelligenceWorkspace role="recruiter" module={String(module)} />;
}
