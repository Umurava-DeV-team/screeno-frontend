"use client";
import { useEffect } from "react";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import type { DemoRole } from "@/lib/demo/types";
export default function PreviewGate({
  role,
  children,
}: {
  role: DemoRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { initialized, isAuthenticated, user } = useAppSelector((s) => s.auth);
  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) router.replace("/auth/" + role + "/login");
    else if (user?.role !== role)
      router.replace("/" + user?.role + "/dashboard");
  }, [initialized, isAuthenticated, user, role, router]);
  if (!initialized || !isAuthenticated || user?.role !== role)
    return <Loading />;
  return <>{children}</>;
}
