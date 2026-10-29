import WorkspaceMotion from "@/components/WorkspaceMotion";
import PreviewGate from "@/components/PreviewGate";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import RecruiterNavbar from "@/components/RecruiterNavbar";
export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PreviewGate role="recruiter">
      <div className="workspace min-h-svh bg-canvas text-ink">
        <RecruiterSidebar />
        <RecruiterNavbar />
        <main className="px-4 pb-16 pt-[88px] lg:ml-[216px] lg:px-6">
          <div className="mx-auto max-w-[1440px]"><WorkspaceMotion>{children}</WorkspaceMotion></div>
        </main>
      </div>
    </PreviewGate>
  );
}
