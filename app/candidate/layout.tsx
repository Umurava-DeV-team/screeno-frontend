"use client";
import WorkspaceMotion from "@/components/WorkspaceMotion";
import { usePathname } from "next/navigation";
import PreviewGate from "@/components/PreviewGate";
import CandidateSidebar from "@/components/CandidateSidebar";
import CandidateNavbar from "@/components/CandidateNavbar";
export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const session = /\/assessments\/[^/]+(?:\/session)?$/.test(path);
  return (
    <PreviewGate role="candidate">
      {session ? (
        <div className="min-h-svh bg-canvas"><WorkspaceMotion>{children}</WorkspaceMotion></div>
      ) : (
        <div className="workspace min-h-svh bg-canvas text-ink">
          <CandidateSidebar />
          <CandidateNavbar />
          <main className="px-4 pb-16 pt-[88px] lg:ml-[216px] lg:px-6">
            <div className="mx-auto max-w-[1440px]"><WorkspaceMotion>{children}</WorkspaceMotion></div>
          </main>
        </div>
      )}
    </PreviewGate>
  );
}
