"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { useGetMeQuery } from "@/redux/api";
import { isSessionClosed } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const { data, isError, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (data) router.replace("/dashboard");
    if (isError && !isSessionClosed()) router.replace("/auth/login");
  }, [data, isError, router]);

  if (isLoading || data) {
    return (
      <div style={{ height: "100dvh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader size="lg" />
      </div>
    );
  }

  return null;
}
