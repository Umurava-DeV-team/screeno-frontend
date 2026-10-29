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
        <main className="px-5 pb-24 pt-[104px] lg:ml-[240px] lg:px-8">
          <div className="mx-auto max-w-[1440px]"><WorkspaceMotion>{children}</WorkspaceMotion></div>
        </main>
      </div>
    </PreviewGate>
  );
}
