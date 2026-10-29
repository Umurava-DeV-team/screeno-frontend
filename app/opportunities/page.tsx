import PublicOpportunities from "@/components/PublicOpportunities";
import LandingNavbar from "@/components/LandingNavbar";
export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  const location =
    typeof params.location === "string" ? params.location.slice(0, 100) : "";
  return (
    <div className="ts-site min-h-svh bg-canvas">
      <LandingNavbar />
      <PublicOpportunities query={query} location={location} />
    </div>
  );
}
