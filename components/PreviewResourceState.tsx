import Link from "next/link";
export default function PreviewResourceState({
  loading,
  error,
}: {
  loading: boolean;
  error?: string | null;
}) {
  return (
    <div
      className="ts-panel p-10 text-center"
      role={error ? "alert" : "status"}
    >
      <p className="text-sm font-medium">
        {loading
          ? "Loading sample records…"
          : error || "This sample record no longer exists."}
      </p>
      {!loading && (
        <Link href="/recruiter/dashboard" className="ts-button secondary mt-5">
          Back to overview
        </Link>
      )}
    </div>
  );
}
